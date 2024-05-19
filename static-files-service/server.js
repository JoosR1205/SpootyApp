const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware para logging
app.use(morgan('common'));

// Limitador de tasa de peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita cada IP a 100 peticiones por ventana de tiempo
  standardHeaders: true, // Devuelve la información del límite de tasa en los encabezados `RateLimit-*`
  legacyHeaders: false, // Deshabilita los encabezados `X-RateLimit-*`
});

// Aplicar el limitador de tasa a todas las peticiones
app.use(limiter);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Redirigir todas las solicitudes a 'index.html'
app.get('*', (req, res) => {
res.sendFile(path.resolve(__dirname, 'public', 'HTML', 'index.html'));
});

// Escuchar en el puerto especificado
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
