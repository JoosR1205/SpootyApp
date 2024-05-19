const jwt = require('jsonwebtoken');

function ensureAuthenticated(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.sendStatus(401); // No se encontró el token
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.sendStatus(401); // Token no válido o expirado
        }
        req.user = decoded;
        next();
    });
}

module.exports = { ensureAuthenticated };
