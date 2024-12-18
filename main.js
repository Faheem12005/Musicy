const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { Sequelize, DataTypes, Model } = require('sequelize');

// Single Sequelize instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'musicy.db',
});

// Define Playlist Model
class Playlist extends Model {}

Playlist.init(
    {
        id: {
            type: DataTypes.UUIDV4,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
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

// Function to create directories
const makeDirectory = () => {
    try {
        if (!fs.existsSync(path.join(__dirname, '/songs'))) {
            fs.mkdirSync(path.join(__dirname, '/songs'));
        }
        if (!fs.existsSync(path.join(__dirname, '/playlistImages'))) {
            fs.mkdirSync(path.join(__dirname, '/playlistImages'));
        }
        console.log('Directories created successfully.');
    } catch (error) {
        console.error('Error creating directories:', error);
    }
};

// Function to create a playlist
const createPlaylist = async (input) => {
    try {
        const playlist = await Playlist.create({ name: input });
        console.log('New playlist:', playlist.toJSON());
    } catch (error) {
        console.error('Error creating playlist:', error);
    }
};

// Create the main application window
const createWindow = () => {
    const win = new BrowserWindow({
        devTools: true,
        backgroundColor: '#282828',
        titleBarStyle: 'hidden',
        width: 800,
        height: 600,
        webPreferences: {
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
    ipcMain.on('create-playlist-directory', () => {
        makeDirectory();
    });

    ipcMain.on('create-new-playlist', async (event, input) => {
        await createPlaylist(input);
    });

    // Create the app window
    createWindow();
});
