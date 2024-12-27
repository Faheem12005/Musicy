export const appendPlaylist = (playlist) => {
    //playlist is the object that we get from the database
    const songContainer = document.getElementById('playlist-sidebar');
    const playlistItem = document.createElement('button');
    playlistItem.addEventListener('click', () => openPlaylist(playlistItem.id));
    playlistItem.className = 'playlist-btn';
    playlistItem.setAttribute("id", `${playlist.dataValues.id}-${playlist.dataValues.name}`)
    playlistItem.style.backgroundImage = "url('./playlistImages/placeholder.png')";
    songContainer.appendChild(playlistItem);
}

const openPlaylist = async (buttonId) => {
    console.log(`opening playlist... ${buttonId}`);
    const id = buttonId.split('-')[0];
    console.log(id);
    const playlistDetails = await window.playlist.getPlaylistDetails(id);
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
                <div class='play-song-btn' id='${song.songUrl}'>
                    <p class='song-name'>${song.songName}</p>
                    <p class='song-artist' >${song.songArtist}</p>
                    <div class="song-configure-btn"><img src="icons/playlist/gear-solid.svg"></div>
                    <p>${getTimeString(song.songDuration)}</p>
                </div>
                </li>
            `).join('')}
            </ul>
        </div>
        `;


        //CODE TO OPEN MODAL FOR CONFIGURING SONG METADATA 
    const songItems = document.getElementsByClassName('play-song-btn');
    for (const songItem of songItems) {
        const configureButton = songItem.querySelector('.song-configure-btn');
        configureButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent event bubbling

            // Get song data
            const songName = songItem.querySelector('.song-name').textContent;
            const songArtist = songItem.querySelector('.song-artist').textContent;

            // Create a modal popup
            const modal = document.createElement('div');
            modal.classList.add('modal');

            // Modal content
            modal.innerHTML = `
            <div class="modal-content">
                <p>Edit Song Details</p>
                <div>
                    <label for="song-name-input">Song Name:</label>
                    <input type="text" id="song-name-input" value="${songName}">
                </div>
                <div>
                    <label for="song-artist-input">Song Artist:</label>
                    <input type="text" id="song-artist-input" value="${songArtist}">
                </div>
            </div>
        `;

            // Append modal to body
            document.body.appendChild(modal);


            document.addEventListener('keydown', async (event) => {
                if(event.key !== 'Enter') {
                    return;
                }
                const newName = modal.querySelector('#song-name-input').value;
                const newArtist = modal.querySelector('#song-artist-input').value;

                // Update the song data in the original item
                songItem.querySelector('.song-name').textContent = newName;
                songItem.querySelector('.song-artist').textContent = newArtist;

                //now that the song details are updated, need to send request to database
                try {
                    await window.playlist.updateSong(songItem.id, newName, newArtist);
                }
                catch(error) {
                    console.error('error occured while updating the database for song configuration: ', error);
                }
                finally{
                    // Close the modal
                    modal.remove();
                }
            });

            document.addEventListener('keydown', (event) => {
                // Close the modal
                if(event.key == 'Escape') {
                    modal.remove();
                }
            });

            // Close the modal when clicking outside it
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        });
    }

    document.getElementById(`${id}-add-songs-btn`).addEventListener('click', async () => {
        window.playlist.getSongDialog(id);
    });
    //map songs to a event listener
    const playButtons = document.querySelectorAll('.play-song-btn');
    playButtons.forEach((button) => {

        button.addEventListener('dblclick', async (event) => {
            console.log(`button pressed with url: ` + button.id);
            const audio = document.getElementById("audio-element");
            audio.autoplay = true;
            const appDataPath = await window.playlist.getAppDataPath();
            const inputPath = `${appDataPath}/songs/${button.id}`;
            const fixedPath = inputPath
                .replace(/\\/g, '/')          // Replace backslashes with forward slashes
                .replace(/ /g, '%20')         // Replace spaces with %20
                .replace(/\[/g, '%5B')        // Replace "[" with %5B
                .replace(/\]/g, '%5D');
            audio.src = fixedPath;
            document.getElementById('track-name').innerText = button.children[0].innerText;
            document.getElementById('track-artist').innerText = button.children[1].innerText;
        });
    })
}

export const getTimeString = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};