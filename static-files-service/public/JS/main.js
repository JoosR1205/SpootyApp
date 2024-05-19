// Obtener el token de la URL y almacenarlo en localStorage
function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
        localStorage.setItem('jwtToken', token);
    }
}

// Obtener el token del localStorage
function getToken() {
    return localStorage.getItem('jwtToken');
}

// Cargar datos iniciales y configurar el evento de cambio del selector
document.addEventListener('DOMContentLoaded', () => {
    getTokenFromUrl();
    document.getElementById('timeRangeSelector').addEventListener('change', (e) => {
        loadData(e.target.value);
        fetchTopGenres(e.target.value);
    });
    loadData('short_term');
    fetchTopGenres('short_term');
});

function loadData(timeRange) {
    const token = getToken(); // Obtener el token del localStorage
    if (!token) {
        console.error('Token not found');
        return;
    }

    fetch(`http://localhost:3001/user-info?time_range=${timeRange}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        updateUI(data);
    })
    .catch(error => console.error('Error fetching data:', error));
}

function updateUI(data) {
    // Actualizar el nombre del usuario y la foto
    const userNameElement = document.getElementById('user-name');
    const userPhotoElement = document.getElementById('user-photo');

    userNameElement.textContent = `Hola, ${data.profile.displayName}`;
    userPhotoElement.src = data.profile.photo || 'default-user-photo.png'; // Asegúrate de tener una foto por defecto

    const artistContainer = document.querySelector('.artist-list');
    if (data.topArtists && data.topArtists.length > 0) {
        artistContainer.innerHTML = data.topArtists.map(artist => 
            `<div class="artist-item">
                <div class="circle" style="background-image: url('${artist.images[0].url}');"></div>
                <p>${artist.name}</p>
            </div>`
        ).join('');
    } else {
        artistContainer.innerHTML = '<p>No artists found</p>';
    }

    const songContainer = document.querySelector('.song-list');
    if (data.topTracks && data.topTracks.length > 0) {
        songContainer.innerHTML = data.topTracks.map(track => 
            `<div class="track-item">
                <div class="square" style="background-image: url('${track.album.images[0].url}');"></div>
                <p>${track.name}</p>
            </div>`
        ).join('');
    } else {
        songContainer.innerHTML = '<p>No tracks found</p>';
    }
}

function fetchTopGenres(timeRange) {
    const token = getToken(); // Obtener el token del localStorage
    if (!token) {
        console.error('Token not found');
        return;
    }

    fetch(`http://localhost:3002/top-genres?time_range=${timeRange}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(genres => {
        console.log('Fetched Genres:', genres); // Añade esta línea para depuración
        const genreContainer = document.querySelector('.genre-list');
        genreContainer.innerHTML = genres.slice(0, 50).map(genre => 
            `<div class="genre-item">
                <p>${genre}</p>
            </div>`
        ).join('');
    })
    .catch(error => console.error('Error fetching top genres:', error));
}
