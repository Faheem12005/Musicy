import { getTimeString } from "../utils/playlist.js";
import { getNextSong, getCurrentSongIndex, playSong, setCurrentSongIndex, getQueue } from "../utils/songQueue.js";

const audio = document.getElementById('audio-element');

audio.addEventListener('loadeddata', () => {
    document.getElementById('play-btn').disabled = false;
    document.getElementById('seek-bar').disabled = false;
    document.getElementById('play-btn').children[0].setAttribute('src', './icons/controls/pause-solid.svg');
})

//event listener to check for the seek bar
audio.addEventListener('timeupdate', () => {
    if(audio.paused) {
        return;
    }
    const duration = Math.round(audio.duration);
    const currentTime = Math.round(audio.currentTime);
    document.getElementById('total-duration').innerText = getTimeString(duration);
    document.getElementById('current-time').innerText = getTimeString(currentTime);
    const seekbar = document.getElementById('seek-bar');
    const value = audio.currentTime / audio.duration;
    seekbar.value = value * 100;
})


//debouncer while seeking ensures that audio warping not present duirng continous seeking
let seekDebounceId;
audio.addEventListener('seeking', async () => {
    if(!audio.paused) {
        clearTimeout(seekDebounceId);
        await audio.pause();
        seekDebounceId = setTimeout( async () => {
            if(audio.paused) {
                await audio.play();
            }
        }, 300);
    }
})

document.getElementById('play-btn').addEventListener('click', async (event) => {
    //code to update the play and pause button
    if (audio.paused) {
        document.getElementById('play-btn').children[0].setAttribute('src', 'icons/controls/pause-solid.svg');
        document.getElementById('play-btn').disabled = true;
        await audio.play();
        document.getElementById('play-btn').disabled = false;
    }
    else {
        document.getElementById('play-btn').children[0].setAttribute('src', 'icons/controls/play-solid.svg');
        document.getElementById('play-btn').disabled = true;
        await audio.pause();
        document.getElementById('play-btn').disabled = false;
    }
});

document.getElementById('next-btn').addEventListener('click', async (event) => {
    const audio = document.getElementById('audio-element');
    await audio.pause();
    audio.dispatchEvent(new Event('ended'));
});

document.getElementById('prev-btn').addEventListener('click', async (event) => {
    const audio = document.getElementById('audio-element');
    const songQueue = getQueue();
    let index = getCurrentSongIndex();
    if (index > 0) {
        index--;
    }
    else {
        index = songQueue.length - 1;
    }
    setCurrentSongIndex(index);
    playSong(index);
});

document.getElementById("audio-element").addEventListener('ended', () => {
    const nextSong = getNextSong();
    if (nextSong) {
        playSong(getCurrentSongIndex());
    }
});

//event listener to update queue modal when songs are queued up or queue is updated,
document.getElementById("audio-element").addEventListener('playing', () => {
    let currentSongIndex = getCurrentSongIndex();
        //change the currently playing song in the queue
        document.querySelector('.queue-song-name').innerText = getQueue()[currentSongIndex].songName;
        document.querySelector('.queue-song-artist').innerText = getQueue()[currentSongIndex].songArtist;
        //shifting elements in the queue
        const queueContainer = document.querySelector('.queue-songs');
        let queueHTML = '';
        for (let i = 0; i < getQueue().length - 1; i++) {
            currentSongIndex = (currentSongIndex + 1) % getQueue().length;
            const song = getQueue()[currentSongIndex];
            queueHTML += `
            <div class="queue-song-details">
                <p class="queue-song-name">${song.songName}</p>
                <p class="queue-song-artist">${song.songArtist}</p>
            </div>
            `;
        }
        console.log(queueHTML);
        queueContainer.innerHTML = queueHTML;
});

const seekBar = document.getElementById('seek-bar');
seekBar.addEventListener('input', (event) => {
    const audio = document.getElementById('audio-element');
    const value = (event.target.value / 100) * audio.duration;
    audio.currentTime = value;
});

document.getElementById('queue-btn').addEventListener('click', () => {
    const modal = document.getElementById('queue-modal');
    if(modal.style.display === 'block') {
        modal.style.display = 'none';
        return;
    } else {
        modal.style.display = 'block';
    }
});