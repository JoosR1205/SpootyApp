require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Importar cors
const morgan = require('morgan');
const { ensureAuthenticated } = require('./authentication');
const { fetchData } = require('./fetchData');
const failureInjection = require('./failure-injection'); // Importar el middleware
const app = express();

app.use(morgan('combined'));
app.use(cors({
origin: 'http://localhost:3003'
})); // Permitir solicitudes desde el servicio de archivos estáticos
app.use(express.json());

// Usar el middleware de inyección de fallos
app.use(failureInjection);

app.get('/top-genres', ensureAuthenticated, async (req, res) => {
const accessToken = req.user.accessToken;
const timeRange = req.query.time_range || 'short_term'; // Default to short_term if not specified
let genreCount = {};

try {
    const topArtists = await fetchData(`https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`, accessToken);

    for (const artist of topArtists.items) {
    artist.genres.forEach(genre => {
        if (genreCount[genre]) {
        genreCount[genre]++;
        } else {
        genreCount[genre] = 1;
        }
    });
    }

    const sortedGenres = Object.keys(genreCount).sort((a, b) => genreCount[b] - genreCount[a]).slice(0, 50);
    res.json(sortedGenres);
} catch (error) {
    console.error('API request error: ', error);
    res.status(500).send(`Error fetching top genres from Spotify: ${error.message}`);
}
});

// Middleware centralizado de manejo de errores
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Hubo un problema con su solicitud. Por favor, intente nuevamente más tarde.');
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
console.log(`Genres Service running on http://localhost:${PORT}`);
});
