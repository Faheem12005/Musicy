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
    console.log("opening playlist...");
    const playlistDetails = await window.playlist.getPlaylistDetails(buttonId);
    console.log(playlistDetails);
}

const loadPlaylists = async () => {
    console.log('loading playlists...');
    const playlists = await window.playlist.getPlaylists();
    console.log(playlists);
    const songContainer = document.getElementById('playlist-sidebar');
    playlists.forEach(entry => {
        //we have the entries, now to render them in the playlist sidebar
        // this code is creating the button and adding the attributes to it
        console.log(entry);
        const playlistItem = document.createElement('button');
        playlistItem.addEventListener('click', () => openPlaylist(`${entry.dataValues.id}-${entry.dataValues.name}`));
        playlistItem.className = 'playlist-btn';
        playlistItem.setAttribute("id", `${entry.dataValues.id}-${entry.dataValues.name}`)
        playlistItem.style.backgroundImage = "url('./playlistImages/placeholder.png')";
        songContainer.appendChild(playlistItem);
    });
}

loadPlaylists();