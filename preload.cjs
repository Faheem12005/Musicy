const { contextBridge, ipcRenderer } = require('electron/renderer');
const path = require('path');

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
        },
        getcwd: () => path.resolve(__dirname),

        updateSong: (songId, newName, newArtist) => {
            ipcRenderer.send('updateSong', [songId, newName, newArtist]);
        }
    },
)