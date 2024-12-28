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

export { setQueue, getQueue, setCurrentSongIndex, getCurrentSongIndex, getNextSong };