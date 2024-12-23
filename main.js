const { app, BrowserWindow, ipcMain, dialog, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { Sequelize, DataTypes, Model } = require('sequelize');
const { defaultApp } = require('node:process');

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
            allowNull: false,
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

//function to add a song to the database
const addSong = async(songUrl, songName) => {
    try {
        if(typeof songName !== 'string' || typeof songUrl !== 'string' || !songName || !songUrl) {
            console.log("invalid song data");
            return;
        }
        await Song.create({ songName: songName, songUrl: songUrl});
    } 
    catch(error) {
        if(error instanceof Sequelize.UniqueConstraintError) {
            console.error('error adding songs');
        }
        else { console.log(error); }
    }
}

const updateSongs = async(songUrl, songName) => {
    const songs = fs.readdirSync('songs');
    songs.forEach(songUrl => {
        addSong(songUrl, "PlaceHolder name");
    });
}

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

const getSongs = async () => {
    try {
        const songs = await Song.findAll();
        return songs;
    }
    catch(error) {
        console.error("error getting songs: ", error);
    }
    
}

const getPlaylistDetails = async (buttonId) => {
    const playlist = await Playlist.findByPk(buttonId, {
        include : {
            model: Song,
        }
    });
    return playlist.toJSON();
}

// Create the main application window
const createWindow = () => {
    const win = new BrowserWindow({
        devTools: true,
        backgroundColor: '#282828',
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadFile('index.html');
    win.once('ready-to-show', () => {
        win.show();
    });
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
    await updateSongs();
    // Listen for IPC events
    ipcMain.on('create-new-playlist', async (event, input) => {
        await createPlaylist(input);
    });

    ipcMain.handle('getPlaylists', async (event) => {
        const playlists = await Playlist.findAll();
        return playlists;
    });

    ipcMain.handle('getSongs', getSongs);

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
        
                // Find the song in the database
                const song = await Song.findOne({
                    where: {
                        songUrl: localSongUrl,
                    },
                });
        
                if (!song) {
                    console.error(`Song with URL ${localSongUrl} not found in the database.`);
                    continue;
                }
        
                console.log(song);
                console.log("trying to add association between playlist and song " + playlist.dataValues.id + song.dataValues.songId);
                // Associate the song with the playlist
                await playlist.addSong(song);
                console.log(`Added song '${localSongUrl}' to playlist.`);
            }
        } catch (error) {
            console.error("Error while adding songs to playlist:", error);
        }
    });
    
    // Create the app window
    createWindow();
});
