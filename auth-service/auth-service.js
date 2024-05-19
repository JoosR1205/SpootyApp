const express = require('express');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const session = require('express-session');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config({ path: '.env' });
const client = require('prom-client');
const failureInjection = require('./failure-injection'); // Importar el middleware

// Configurar el registro de Prometheus
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Crear un nuevo registro
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Inicializar la aplicación Express
const app = express();

// Usar Morgan para el registro de solicitudes HTTP
app.use(morgan('combined'));

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3003', // Permitir solicitudes desde el servicio de archivos estáticos
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

// Usar el middleware de inyección de fallos
app.use(failureInjection);

// Ruta para exponer métricas de Prometheus
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});

// Configuración de la sesión con mejoras de seguridad
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true }
}));

// Inicialización de Passport y manejo de sesiones
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('../static-files-service/public'));

// Estrategia de autenticación de Spotify
passport.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL: process.env.SPOTIFY_CALLBACK_URL
  },
  function(accessToken, refreshToken, expires_in, profile, done) {
    profile.accessToken = accessToken;
    if (profile) {
      return done(null, profile);
    }
    return done(new Error("Error de autenticación con Spotify"), null);
  }
));

// Serializar y deserializar el usuario
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Rutas de autenticación
app.get('/auth/spotify',
  passport.authenticate('spotify', {
    scope: [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-library-read',
      'playlist-read-private',
      'playlist-modify-private',
      'playlist-modify-public',
      'user-read-playback-state',
      'user-modify-playback-state'
    ]
  }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    const token = jwt.sign({
      user: req.user.id,
      accessToken: req.user.accessToken
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.redirect(`http://localhost:3003/HTML/main.html?token=${token}`);
  });

// Ruta principal
app.get('/', (req, res) => {
  res.send('Servicio de Autenticación con Spotify');
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Hubo un problema con su solicitud. Por favor, intente nuevamente más tarde.');
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
});
