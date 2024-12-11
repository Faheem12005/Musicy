const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld(
    'playlist', {
        create: () => {
            ipcRenderer.send('create-playlist-directory');
        },
        createPlaylist: (input) => {
            ipcRenderer.send('create-new-playlist', input);
        }
    }
)