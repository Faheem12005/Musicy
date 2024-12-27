import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { Sequelize, DataTypes, Model } from 'sequelize';
import * as mm from 'music-metadata';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Paths for persistent storage
const userDataPath = app.getPath('userData');
const songsDirectory = path.join(userDataPath, 'songs');
const playlistImagesDirectory = path.join(userDataPath, 'playlistImages');
const databasePath = path.join(userDataPath, 'musicy.db');

// Initialize Sequelize instance
const sequelize = new Sequelize({
    logging: false,
    dialect: 'sqlite',
    storage: databasePath,
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

// Define Song Model
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
        },
    },
    { sequelize, timestamps: false }
);

// Define relationships
Song.belongsToMany(Playlist, { through: 'PlaylistSong' });
Playlist.belongsToMany(Song, { through: 'PlaylistSong' });

// Function to initialize database
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');
        await sequelize.sync();
        console.log('Database tables synced.');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

// Function to create directories for storing assets
const makeDirectory = () => {
    try {
        const directories = [songsDirectory, playlistImagesDirectory];
        directories.forEach((dir) => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    } catch (error) {
        console.error('Error creating directories:', error);
    }
};

// Function to create a playlist
const createPlaylist = async (name) => {
    try {
        const playlist = await Playlist.create({ name });
        return playlist;
    } catch (error) {
        console.error('Error creating playlist:', error);
        return null;
    }
};

// Function to retrieve playlist details
const getPlaylistDetails = async (playlistId) => {
    try {
        const playlist = await Playlist.findByPk(playlistId, {
            include: [Song],
        });
        return playlist ? playlist.toJSON() : null;
    } catch (error) {
        console.error('Error fetching playlist details:', error);
        return null;
    }
};

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
    win.once('ready-to-show', () => win.show());
    win.webContents.openDevTools();
};

// Function to add songs to a playlist
const addSongsToPlaylist = async (playlistId, songPaths) => {
    try {
        const playlist = await Playlist.findByPk(playlistId);
        if (!playlist) throw new Error('Playlist not found');

        for (const songPath of songPaths) {
            const localSongUrl = path.basename(songPath);
            const filePath = path.join(songsDirectory, localSongUrl);
            const metadata = await mm.parseFile(filePath);

            // Prompt user for missing metadata
            if (!metadata.common.title || !metadata.common.artist) {
                console.warn(`Missing metadata for ${localSongUrl}`);
                continue;
            }

            const [song] = await Song.findOrCreate({
                where: { songUrl: localSongUrl },
                defaults: {
                    songName: metadata.common.title,
                    songArtist: metadata.common.artist,
                    songDuration: metadata.format.duration,
                    songUrl: localSongUrl,
                },
            });

            await playlist.addSong(song);
            console.log(`Added song '${localSongUrl}' to playlist.`);
        }
    } catch (error) {
        console.error('Error while adding songs to playlist:', error);
    }
};

// Electron app events
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(async () => {
    await initializeDatabase();
    makeDirectory();

    ipcMain.handle('create-new-playlist', async (event, name) => {
        console.log('Creating new playlist:', name);
        const playlist = await createPlaylist(name);
        return playlist;
    });

    ipcMain.handle('getPlaylists', async () => {
        return Playlist.findAll();
    });

    ipcMain.handle('getPlaylistDetails', async (event, playlistId) => {
        return getPlaylistDetails(playlistId);
    });

    ipcMain.handle('getAppDataPath', () => {
        return app.getPath('userData');
    });

    ipcMain.on('getSongDialog', async (event, playlistId) => {
        const songPaths = dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), {
            title: 'Add songs',
            buttonLabel: 'Add Song(s)',
            defaultPath: songsDirectory,
            filters: [{ name: 'Audio', extensions: ['mp3'] }],
            properties: ['multiSelections', 'dontAddToRecent'],
        });
        if (songPaths) await addSongsToPlaylist(playlistId, songPaths);
    });

    ipcMain.on('updateSong', async (event, { songUrl, songName, songArtist }) => {
        try {
            const song = await Song.findOne({ where: { songUrl } });
            if (!song) throw new Error('Song not found');

            song.set({ songName, songArtist });
            await song.save();
        } catch (error) {
            console.error('Error updating song:', error);
        }
    });

    createWindow();
});