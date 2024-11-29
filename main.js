const { app, BrowserWindow } = require('electron')
const path = require('node:path');

const createWindow = () => {
    const win = new BrowserWindow({
      backgroundColor: '#282828',
      titleBarStyle: 'hidden',
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })

    win.once('ready-to-show', () => {
      win.show();
    });
    win.loadFile('index.html')
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  createWindow();
})