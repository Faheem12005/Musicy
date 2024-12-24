document.getElementById('create-playlist').addEventListener('click', () => {
    // The create function creates the folder to store the songs
    document.getElementsByClassName('popup-overlay')[0].style.display = "flex"

    const escapeKey = (event) => {
        if (event.key === "Escape") {
            document.getElementsByClassName('popup-overlay')[0].style.display = "none"
            document.removeEventListener('keydown', escapeKey);
        }
    }

    //this function creates the indiviual playlists
    const enterKey = async (event) => {
        if (event.key === "Enter") {
            const input = document.getElementById('playlist-input')
            console.log(input.value);
            if (input.value !== '') {
                window.playlist.createPlaylist(input.value);
            }
            input.value = '';
            document.getElementsByClassName('popup-overlay')[0].style.display = "none"
            document.removeEventListener('keydown', enterKey);
        }
    }

    document.addEventListener('keydown', escapeKey);
    document.addEventListener('keydown', enterKey);
})

const getTimeString = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const openPlaylist = async (buttonId) => {
    console.log(`opening playlist... ${buttonId}`);
    const id = buttonId.split('-')[0];
    console.log(id);
    const playlistDetails = await window.playlist.getPlaylistDetails(id);
    console.log(playlistDetails);
    //now that i have playlist details, i need to replace whatevers there on the webpage currently
    // also need to add a add button for adding songs to playlist, change image, etc here
    const name = playlistDetails.name;
    const imgURL = playlistDetails.image;
    const songs = playlistDetails.Songs; //array of songs
    document.getElementById('playlist-view').innerHTML = `
        <div id="playlist-details">
            <img class="playlist-img" src=${imgURL === null ? 'images/placeholder.png' : imgURL}>
            <div id="playlist-text">
                <p>Playlist</p>
                <p class="playlist-title">${name}</p>
            </div>
        </div>
        <button id="${id}-add-songs-btn">Add Songs</button>
        <hr>
        <div id='song-container'>
            <ul>
            ${songs.map((song) => `
                <li>
                <button class='play-song-btn' id='${song.songUrl}'>
                    <p>${song.songName}</p>
                    <p></p>
                </button>
                </li>
            `).join('')}
            </ul>
        </div>
        `;
    document.getElementById(`${id}-add-songs-btn`).addEventListener('click', async () => {
        window.playlist.getSongDialog(id);
    });
    //map songs to a event listener
    const playButtons = document.querySelectorAll('.play-song-btn');
    playButtons.forEach((button) => {

        button.addEventListener('click', () => {
            console.log(`button pressed with url: ` + button.id);
            const audio = document.getElementById("audio-element");
            audio.autoplay = true;
            inputPath = `songs/${button.id}`;
            const fixedPath = inputPath
                .replace(/\\/g, '/')          // Replace backslashes with forward slashes
                .replace(/ /g, '%20')         // Replace spaces with %20
                .replace(/\[/g, '%5B')        // Replace "[" with %5B
                .replace(/\]/g, '%5D');
            audio.src = fixedPath;
        });
    })
}


const loadPlaylists = async () => {
    console.log('loading playlists...');
    const playlists = await window.playlist.getPlaylists();
    console.log(playlists);
    const songContainer = document.getElementById('playlist-sidebar');
    playlists.forEach(entry => {
        //we have the entries, now to render them in the playlist sidebar
        // this code is creating the button and adding the attributes to it
        // console.log(entry);
        // attributes:
        // id
        // image
        // name
        const playlistItem = document.createElement('button');
        playlistItem.addEventListener('click', () => openPlaylist(playlistItem.id));
        playlistItem.className = 'playlist-btn';
        playlistItem.setAttribute("id", `${entry.dataValues.id}-${entry.dataValues.name}`)
        playlistItem.style.backgroundImage = "url('./playlistImages/placeholder.png')";
        songContainer.appendChild(playlistItem);

    });
}

loadPlaylists();