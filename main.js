const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path');
const fs = require('node:fs');

const makeDirectory = (event) => {
  try {
    if(!fs.existsSync(path.join(__dirname, '/music', '/playlists'))) {
      fs.mkdirSync(path.join(__dirname, '/music','playlists'));
    }
    //stores the songs
    if(!fs.existsSync(path.join(__dirname, '/music', '/songs'))) {
      fs.mkdirSync(path.join(__dirname, '/music', '/songs'));
    }
  }
  catch(error) {
    console.log(error);
  }
}

const createPlaylist = (input) => {  
  try {
    if(!fs.existsSync(path.join(__dirname, '/music/playlists'))) {
      fs.mkdirSync(path.join(__dirname, '/music/playlists'));
    }
    fs.mkdirSync(path.join(__dirname, `/music/playlists/${input}`))
  }
  catch(error) {
    console.log(error);
  }
}

const createWindow = () => {
    const win = new BrowserWindow({
      devTools: true,
      backgroundColor: '#282828',
      titleBarStyle: 'hidden',
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    
    win.loadFile('index.html')
    win.once('ready-to-show', () => {
      win.show();
    });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {

  ipcMain.on('create-playlist-directory', (event) => {
    makeDirectory(event);
  })

  ipcMain.on('create-new-playlist', (event, input) => {
    createPlaylist(input);
  })

  createWindow();
})