const fetch = require('node-fetch');

async function fetchData(url, accessToken) {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
    }
    return response.json();
}

module.exports = { fetchData };
