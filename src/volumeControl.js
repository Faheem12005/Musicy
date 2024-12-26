const volumeBar = document.getElementById('volume-bar');
const volumeButton = document.getElementById('mute-btn');
const audioElement = document.getElementById('audio-element');

let prevVolume = audioElement.volume || 0.5;
let isMuted = false;

// Update the audio volume and UI based on the volume bar input
volumeBar.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    if (value === 0) {
        mute();
    } else {
        if (!isMuted) {
            prevVolume = value; // Update previous volume only when not muted
        }
        updateVolume(value);
        isMuted = false;
    }
});

volumeButton.addEventListener('click', () => {
    isMuted ? unmute() : mute();
});

// Mute the audio and update the UI
const mute = () => {
    prevVolume = audioElement.volume > 0 ? audioElement.volume : prevVolume; // Store previous volume only if its greater than zero
    updateVolume(0);
    isMuted = true;
};

const unmute = () => {
    updateVolume(prevVolume);
    isMuted = false;
};

// Helper function to update audio volume and UI
const updateVolume = (volume) => {
    audioElement.volume = volume;
    volumeBar.value = volume;
    volumeButton.children[0].setAttribute(
        'src',
        volume === 0
            ? 'icons/controls/volume-mute-solid.svg'
            : 'icons/controls/volume-low-solid.svg'
    );
};
