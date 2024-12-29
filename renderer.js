import { appendPlaylist } from "./utils/playlist.js";

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
                //create the playlist, return the object here and append it to the playlist list sidebar
                const playlist = await window.playlist.createPlaylist(input.value);
                if(playlist === null) {
                    console.log('Playlist already exists');
                }
                else{
                    console.log(playlist);
                    appendPlaylist(playlist);
                }
            }
            input.value = '';
            document.getElementsByClassName('popup-overlay')[0].style.display = "none"
            document.removeEventListener('keydown', enterKey);
        }
    }

    document.addEventListener('keydown', escapeKey);
    document.addEventListener('keydown', enterKey);
})



const loadPlaylists = async () => {
    const playlists = await window.playlist.getPlaylists();
    playlists.forEach(entry => {
        appendPlaylist(entry);
    });
}

loadPlaylists();

