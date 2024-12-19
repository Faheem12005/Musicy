const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { Sequelize, DataTypes, Model } = require('sequelize');

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
        songs: {
            type: DataTypes.STRING,
        },
    },
    { sequelize, timestamps: false }
);

// Function to sync database tables
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');
        await Playlist.sync();
        console.log('Playlist table synced.');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

// Function to create a playlist
const createPlaylist = async (input) => {
    try {
        const playlist = await Playlist.create({ name: input });
        console.log('New playlist:', playlist.toJSON());
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

const getSongs = () => {
    songs = fs.readdirSync('songs');
    console.log(songs);
    return songs;
}

const getPlaylistDetails = async (buttonId) => {
    console.log(buttonId);
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
    // Initialize database and create directories
    await initializeDatabase();
    makeDirectory();
    // Listen for IPC events
    ipcMain.on('create-new-playlist', async (event, input) => {
        await createPlaylist(input);
    });

    ipcMain.handle('getPlaylists', async (event) => {
        const playlists = await Playlist.findAll();
        console.log(playlists);
        return playlists;
    });

    ipcMain.handle('getSongs', getSongs);

    ipcMain.handle('getPlaylistDetails', async(event, buttonId) => {
        return getPlaylistDetails(buttonId);
    }); 
    // Create the app window
    createWindow();
});
