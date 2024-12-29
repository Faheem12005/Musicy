let songQueue = [];
let currentSongIndex = 0;

function setQueue(queue) {
    songQueue = queue;
}

function getQueue() {
    return songQueue;
}

function setCurrentSongIndex(index) {
    currentSongIndex = index;
}

function getCurrentSongIndex() {
    return currentSongIndex;
}

function getNextSong() {
    currentSongIndex++;
    if (currentSongIndex < songQueue.length) {
    }
    else{
        currentSongIndex = 0;
    }
    return songQueue[currentSongIndex];
}


const playSong = async (index) => {
    const audio = document.getElementById("audio-element");
    const songQueue = getQueue();
    if (index >= 0 && index < songQueue.length) {
        const song = songQueue[index];
        //construction path to the song
        const appPath = await window.playlist.getAppDataPath();
        audio.src = `${appPath}/songs/${song.songUrl}`;
        document.getElementById('track-name').innerText = song.songName;
        document.getElementById('track-artist').innerText = song.songArtist;
    }
}

export { setQueue, getQueue, setCurrentSongIndex, getCurrentSongIndex, getNextSong, playSong };