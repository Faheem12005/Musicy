import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { Sequelize, DataTypes, Model } from 'sequelize';
import * as mm from 'music-metadata';


import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Single Sequelize instance
const sequelize = new Sequelize({
    logging: false,
    dialect: 'sqlite',
    storage: 'musicy.db',
});

// Define Playlist Model
class Playlist extends Model {}

Playlist.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
        },
    },
    { sequelize, timestamps: false }
);

class Song extends Model {}

Song.init(
    {
        songId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        songName: {
            type: DataTypes.STRING,
        },
        songArtist: {
            type: DataTypes.STRING,
        },
        songDuration: {
            type: DataTypes.DOUBLE,
        },
        songUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        }
    },
    { sequelize, timestamps: false}
);

Song.belongsToMany(Playlist, { through: 'PlaylistSong'});
Playlist.belongsToMany(Song, { through: 'PlaylistSong'});

// Function to sync database tables
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');
        await sequelize.sync();
        console.log('Playlist table synced.');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

// Function to create a playlist
const createPlaylist = async (input) => {
    try {
        const playlist = await Playlist.create({ name: input });
        return input;
    } catch (error) {
        console.error('Error creating playlist:', error);
        return null;
    }
};

//function to initlaise directories for storing songs and playlist images if they dont exist
const makeDirectory = () => {
    try {
        if (!fs.existsSync(path.join(__dirname, '/songs'))) {
            fs.mkdirSync(path.join(__dirname, '/songs'));
        }
        if (!fs.existsSync(path.join(__dirname, '/playlistImages'))) {
            fs.mkdirSync(path.join(__dirname, '/playlistImages'));
        }
    } catch (error) {
        console.error('Error creating directories:', error);
    }
};

const getPlaylistDetails = async (buttonId) => {
    const playlist = await Playlist.findByPk(buttonId, {
        include : [
            {
                model: Song,
            }
        ]
    });
    return playlist.toJSON();
}

const preloadPath = path.join(__dirname, 'preload.cjs');

// Create the main application window
const createWindow = () => {
    const win = new BrowserWindow({
        devTools: true,
        backgroundColor: '#282828',
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: preloadPath,
        },
    });

    win.loadFile('index.html');
    win.once('ready-to-show', () => {
        win.show();
    });
    win.webContents.openDevTools();
};

// Electron app events
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(async () => {
    // getSongs();
    // Initialize database and create directories
    await initializeDatabase();
    makeDirectory();
    // Listen for IPC events
    ipcMain.on('create-new-playlist', async (event, input) => {
        await createPlaylist(input);
    });

    ipcMain.handle('getPlaylists', async (event) => {
        const playlists = await Playlist.findAll();
        return playlists;
    });

    ipcMain.handle('getPlaylistDetails', async(event, buttonId) => {
        return getPlaylistDetails(buttonId);
    });

    //function to open dialog to add songs to a playlist
    ipcMain.on('getSongDialog', async (event, playlistId) => {
        const songs = dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), {
            title: "Add songs",
            buttonLabel: "Add Song / Songs",
            defaultPath: path.join(__dirname, 'songs'),
            filters: [ { name: 'Audio', extensions: ['mp3']} ],
            properties: ["multiSelections", "dontAddToRecent"],
        });
        const playlist = await Playlist.findByPk(playlistId);
        //songs is an array of file urls, need to add them to the junction database
        try {
            for (const songUrl of songs) {
                const localSongUrl = songUrl.split("\\").pop();
                console.log("=====================");
                console.log(localSongUrl);
                const filePath = `songs/${localSongUrl}`;
                const metadata = await mm.parseFile(filePath);
                // Find the song in the database, otherwise create entry if not already present

                // IF ANY OF THE METADATA VALUES ARE NULL, NEED TO CREATE A POPUP OR PROMPT USER TO GIVE THEM VALUES

                const song = await Song.findOrCreate({
                    where: {
                        songUrl: localSongUrl,
                    },
                    defaults: {
                        songName: metadata.common.title,
                        songArtist: metadata.common.artist,
                        songDuration: metadata.format.duration,
                        songUrl: localSongUrl
                    }
                });
                //song is an array, with first value being the instance, and the second value being a boolean to indicate if song was
                // created or not
                console.log(song[0]);
                // Associate the song with the playlist
                await playlist.addSong(song[0]);
                console.log(`Added song '${localSongUrl}' to playlist.`);
            }
        } catch (error) {
            console.error("Error while adding songs to playlist:", error);
        }
    });

    ipcMain.on('updateSong', async (event, args) => {
        const songUrl = args[0];
        const songName = args[1];
        const songArtist = args[2];
        try {
            const song = await Song.findOne({
                where: {
                    songUrl: songUrl,
                }
            })
            song.set({
                songName: songName,
                songArtist: songArtist,
            })
            
            //now save it to the database
            await song.save();
        }
        catch(error) {
            console.error("error occured while fetching: ", error);
        }
        
    });
    
    // Create the app window
    createWindow();
});
