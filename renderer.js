document.getElementById('create-playlist').addEventListener('click', () => {
    // The create function creates the folder to store the songs
    window.playlist.create();
    document.getElementsByClassName('popup-overlay')[0].style.display = "flex"

    const escapeKey = (event) => {
        if(event.key === "Escape") {
            document.getElementsByClassName('popup-overlay')[0].style.display = "none"
            document.removeEventListener('keydown', escapeKey);    
        }
    }

    //this function creates the indiviual playlists
    const enterKey = (event) => {
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


