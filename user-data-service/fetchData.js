const fetch = require('node-fetch');

// Función para realizar peticiones a la API de Spotify
async function fetchData(url, accessToken) {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

module.exports = { fetchData };
