document.getElementById('create-playlist').addEventListener('click', () => {
    // The create function creates the folder to store the songs
    document.getElementsByClassName('popup-overlay')[0].style.display = "flex"

    const escapeKey = (event) => {
        if(event.key === "Escape") {
            document.getElementsByClassName('popup-overlay')[0].style.display = "none"
            document.removeEventListener('keydown', escapeKey);    
        }
    }

    //this function creates the indiviual playlists
    const enterKey = async (event) => {
        if(event.key === "Enter") {
            const input = document.getElementById('playlist-input')
            console.log(input.value);
            if(input.value !== '') {
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


const openPlaylist = async (buttonId) => {
    console.log(`opening playlist... ${buttonId}` );
    const id = buttonId.split('-')[0];
    console.log(id);
    const playlistDetails = await window.playlist.getPlaylistDetails(id);
    console.log(playlistDetails);
    //now that i have playlist details, i need to replace whatevers there on the webpage currently
    // also need to add a add button for adding songs to playlist, change image, etc here
    const name = playlistDetails.name;
    const imgURL = playlistDetails.image;
    document.getElementById('playlist-view').innerHTML = 
    `
        <p>${name}</p>
        <button id="${id}-add-img-btn">Add Songs</button>
        <button>Add Image</button>
    `;
    
    document.getElementById(`${id}-add-img-btn`).addEventListener('click', async () => {
        window.playlist.getSongDialog(id);
        //now have a array of filepaths, add them to the playlist

    });
}

const loadPlaylists = async () => {
    console.log('loading playlists...');
    const playlists = await window.playlist.getPlaylists();
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