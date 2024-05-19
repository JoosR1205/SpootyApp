require('dotenv').config(); // Asegúrate de que dotenv esté configurado correctamente

const express = require('express');
const cors = require('cors');
const { ensureAuthenticated } = require('./authentication');
const { fetchData } = require('./fetchData');
const failureInjection = require('./failure-injection'); // Importar el middleware
const app = express();

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3003', // Permitir solicitudes desde el origen especificado
methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
credentials: true
}));

// Usar el middleware de inyección de fallos
app.use(failureInjection);

// Middleware para parsear JSON
app.use(express.json());

// Ruta para obtener datos del usuario
app.get('/user-info', ensureAuthenticated, async (req, res) => {
const timeRange = req.query.time_range || 'long_term';
const limit = 10;
const accessToken = req.user.accessToken;

try {
    // Obtener información del perfil del usuario
    const profile = await fetchData('https://api.spotify.com/v1/me', accessToken);
    const topArtists = await fetchData(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`, accessToken);
    const topTracks = await fetchData(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`, accessToken);

    console.log('User Profile:', profile); // Log the user profile
    console.log('Top Artists:', topArtists); // Log the artists
    console.log('Top Tracks:', topTracks); // Log the tracks

    const userInfo = {
    profile: {
        displayName: profile.display_name,
        photo: profile.images[0]?.url
    },
    topArtists: topArtists.items,
    topTracks: topTracks.items
    };

    res.json(userInfo);
} catch (error) {
    console.error('API request error: ', error);
    res.status(500).send(`Error fetching user data from Spotify: ${error.message}`);
}
});

// Middleware centralizado de manejo de errores
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Hubo un problema con su solicitud. Por favor, intente nuevamente más tarde.');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
console.log(`User Data Service running on http://localhost:${PORT}`);
});
