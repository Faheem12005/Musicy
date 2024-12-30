const { contextBridge, ipcRenderer } = require('electron/renderer');
const path = require('path');

contextBridge.exposeInMainWorld(
    'playlist', {
        createPlaylist: (input) => {
            return ipcRenderer.invoke('create-new-playlist', input);
        },
        getSongs: (playlistId) => {
            return ipcRenderer.invoke('getSongs', playlistId);
        },
        getPlaylists: () => {
            return ipcRenderer.invoke('getPlaylists');
        },
        getPlaylistDetails: (buttonId) => {
            return ipcRenderer.invoke('getPlaylistDetails', buttonId);
        },
        getSongDialog: (playlistId) => {
            return ipcRenderer.invoke('getSongDialog', playlistId);
        },
        getcwd: () => path.resolve(__dirname),

        updateSong: (songId, newName, newArtist) => {
            ipcRenderer.send('updateSong', {songId, newName, newArtist});
        },
        getAppDataPath: () => {
            return ipcRenderer.invoke('getAppDataPath');
        }
    },
)