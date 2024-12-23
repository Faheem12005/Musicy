const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld(
    'playlist', {
        createPlaylist: (input) => {
            ipcRenderer.send('create-new-playlist', input);
        },
        getSongs: () => {
            return ipcRenderer.invoke('getSongs');
        },
        getPlaylists: () => {
            return ipcRenderer.invoke('getPlaylists');
        },
        getPlaylistDetails: (buttonId) => {
            return ipcRenderer.invoke('getPlaylistDetails', buttonId);
        },
        getSongDialog: (playlistId) => {
            ipcRenderer.send('getSongDialog', playlistId);
        }
    }
)