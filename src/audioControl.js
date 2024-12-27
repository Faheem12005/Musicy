import { getTimeString } from "../utils/playlist.js";

const audio = document.getElementById('audio-element');

audio.addEventListener('loadeddata', () => {
    document.getElementById('play-btn').disabled = false;
    document.getElementById('seek-bar').disabled = false;
    console.log("can play event fired");
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


//change the audio elements current time based on the seekbar
const seekBar = document.getElementById('seek-bar');

seekBar.addEventListener('input', (event) => {
    const audio = document.getElementById('audio-element');
    const value = (event.target.value / 100) * audio.duration;
    audio.currentTime = value;
});
