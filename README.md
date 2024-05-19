
# Proyecto SpotyApp

## Introducción
SpotyApp es una aplicación que permite a los usuarios autenticarse con Spotify y ver sus artistas, canciones y géneros más escuchados. El objetivo del proyecto es proporcionar una interfaz sencilla y eficiente para que los usuarios puedan explorar su actividad musical en Spotify.

## Servicios y Funcionalidades

### Servicio de Autenticación
- **Funcionalidad**: Autentica a los usuarios con Spotify y obtiene tokens de acceso.
- **Tecnologías Utilizadas**: Node.js, Express, Passport, Spotify Strategy, JSON Web Tokens (JWT).
- **Flujo de Autenticación**:
  1. El usuario inicia sesión con Spotify.
  2. Se genera un token de acceso y se guarda en la sesión.
  3. El usuario es redirigido a la página principal con un token JWT.

### Servicio de Datos del Usuario
- **Funcionalidad**: Obtiene los datos del usuario, incluyendo sus artistas y canciones más escuchadas.
- **Tecnologías Utilizadas**: Node.js, Express, Axios, CORS.
- **Descripción**: Este servicio usa el token de acceso para recuperar información del perfil del usuario y sus datos musicales desde la API de Spotify.

### Servicio de Géneros
- **Funcionalidad**: Obtiene los géneros más escuchados del usuario.
- **Tecnologías Utilizadas**: Node.js, Express, Axios, CORS.
- **Descripción**: Este servicio analiza los géneros de los artistas más escuchados por el usuario y devuelve una lista ordenada de estos géneros.

### Servicio de Archivos Estáticos
- **Funcionalidad**: Sirve archivos estáticos, como HTML, CSS y JavaScript.
- **Tecnologías Utilizadas**: Node.js, Express, Morgan, Express-Rate-Limit.
- **Descripción**: Este servicio se encarga de servir la interfaz de usuario desde la carpeta `public`.

## Inyección de Fallos y Resiliencia

### Inyección de Fallos
La inyección de fallos se implementa mediante un middleware que simula fallos en el sistema de manera controlada.

#### Ejemplo de Middleware de Inyección de Fallos
```javascript
const failureInjection = (req, res, next) => {
  // Simula una tasa de fallo del 10%
  if (Math.random() < 0.1) {
    return res.status(500).send('Simulated Failure');
  }
  next();
};

module.exports = failureInjection;
```

### Retries con Backoff Exponencial
Usamos `axios-retry` para reintentar solicitudes fallidas con un backoff exponencial.

#### Ejemplo de Uso
```javascript
const axios = require('axios');
const axiosRetry = require('axios-retry');

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount),
  retryCondition: (error) => error.response.status >= 500
});

async function fetchDataWithRetries(url, accessToken) {
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}
```

### Circuit Breaker
Implementamos el patrón Circuit Breaker usando la biblioteca `opossum`.

#### Ejemplo de Uso
```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000
};

const breaker = new CircuitBreaker(fetchDataWithRetries, options);

breaker.fallback(() => {
  return { message: 'Service temporarily unavailable. Please try again later.' };
});

breaker.fire(url, accessToken)
  .then(data => {
    console.log('Data received:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## Monitoreo y Observabilidad
Utilizamos Prometheus para monitorear las métricas del sistema y configurar alertas.

### Configuración de Prometheus
```javascript
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

## Guía de Despliegue

### 1. Clonar el Repositorio
```sh
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en cada servicio con las siguientes variables de entorno:

#### Ejemplo para `auth-service`
```plaintext
SPOTIFY_CLIENT_ID=tu_spotify_client_id
SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret
SPOTIFY_CALLBACK_URL=http://localhost:3000/auth/spotify/callback
SESSION_SECRET=tu_session_secret
JWT_SECRET=tu_jwt_secret
PORT=3000
```

### 3. Construir y Ejecutar los Contenedores con Docker Compose
```sh
docker-compose down
docker-compose up --build
```

### 4. Acceder a la Aplicación
Visita `http://localhost:3003` en tu navegador.

## Conclusiones y Próximos Pasos

### Resumen de lo Aprendido
Hemos creado una aplicación que permite a los usuarios autenticarse con Spotify y explorar sus datos musicales. Implementamos técnicas de resiliencia como retries, circuit breakers, y monitoreo con Prometheus para asegurar la robustez del sistema.

### Posibles Mejoras y Funcionalidades Futuras
- Mejorar la interfaz de usuario con más opciones de visualización de datos.
- Implementar un sistema de caché para mejorar el rendimiento.
- Añadir más métricas y alertas para un monitoreo más detallado.

---

## Introducción

### Introducción al Proyecto

SpotyApp es una aplicación web que permite a los usuarios autenticarse con Spotify y explorar su actividad musical. Al iniciar sesión con su cuenta de Spotify, los usuarios pueden ver información detallada sobre sus artistas, canciones y géneros más escuchados. La aplicación está diseñada para proporcionar una experiencia de usuario atractiva y sencilla, facilitando la visualización y el análisis de los datos musicales personales.

### Objetivos del Proyecto

- **Autenticación Segura**: Implementar un sistema de autenticación que utilice el protocolo OAuth 2.0 de Spotify, garantizando la seguridad y privacidad de los datos del usuario.
- **Visualización de Datos**: Proporcionar una interfaz de usuario intuitiva para que los usuarios puedan explorar fácilmente sus datos musicales.
- **Microservicios Escalables**: Desarrollar la aplicación utilizando una arquitectura basada en microservicios, lo que permite un fácil escalado y mantenimiento de la aplicación.
- **Resiliencia y Robustez**: Asegurar que la aplicación sea robusta y capaz de manejar fallos mediante la implementación de técnicas de inyección de fallos y patrones de resiliencia.
- **Monitoreo y Observabilidad**: Implementar un sistema de monitoreo y alertas utilizando Prometheus para asegurar el rendimiento y la disponibilidad de la aplicación.

## Arquitectura del Proyecto

### Descripción General de la Arquitectura del Sistema

La arquitectura de SpotyApp está diseñada en base a microservicios, donde cada servicio tiene una responsabilidad específica y se comunica con otros servicios a través de APIs RESTful. Esta arquitectura permite un desarrollo modular, facilita el mantenimiento y el escalado, y mejora la resiliencia del sistema.

- **Auth Service**: Maneja la autenticación de usuarios utilizando el protocolo OAuth 2.0 de Spotify. Genera y gestiona tokens de acceso y refresh tokens para acceder a la API de Spotify.
- **User Data Service**: Recupera y procesa los datos del usuario desde Spotify, incluyendo información sobre sus artistas y canciones más escuchadas.
- **Top Genres Service**: Analiza los géneros musicales de los artistas más escuchados por el usuario y proporciona una lista ordenada de géneros.
- **Static Files Service**: Sirve los archivos estáticos de la aplicación, como HTML, CSS y JavaScript, proporcionando la interfaz de usuario.
- **Monitoring Service**: Utiliza Prometheus para recopilar y exponer métricas de los distintos servicios, permitiendo el monitoreo y la observabilidad del sistema.

### Diagrama de Arquitectura

El siguiente diagrama muestra cómo están conectados los distintos servicios de SpotyApp:

![Diagrama de Arquitectura](ruta/a/tu/diagrama.png)

1. **Flujo de Autenticación**:
   - El usuario accede a la página de inicio de sesión servida por el Static Files Service.
   - Al iniciar sesión con Spotify, el Auth Service maneja la autenticación y redirige al usuario de vuelta a la aplicación con un token JWT.

2. **Recuperación de Datos del Usuario**:
   - El User Data Service utiliza el token de acceso para recuperar información del usuario desde la API de Spotify.
   - Los datos del usuario se envían de vuelta al cliente para su visualización.

3. **Análisis de Géneros**:
   - El Top Genres Service analiza los géneros de los artistas más escuchados y proporciona una lista de los géneros más frecuentes.

4. **Monitoreo y Métricas**:
   - El Monitoring Service utiliza Prometheus para monitorear todos los servicios, recolectando métricas de rendimiento y estado.

## Servicios y Funcionalidades

### Servicio de Autenticación
- **Funcionalidad**: Autentica a los usuarios con Spotify y obtiene tokens de acceso.
- **Tecnologías Utilizadas**: Node.js, Express, Passport, Spotify Strategy, JSON Web Tokens (JWT).
- **Flujo de Autenticación**:
  1. El usuario inicia sesión con Spotify.
  2. Se genera un token de acceso y se guarda en la sesión.
  3. El usuario es redirigido a la página principal con un token JWT.

### Servicio de Datos del Usuario
- **Funcionalidad**: Obtiene los datos del usuario, incluyendo sus artistas y canciones más escuchadas.
- **Tecnologías Utilizadas**: Node.js, Express, Axios, CORS.
- **Descripción**: Este servicio usa el token de acceso para recuperar información del perfil del usuario y sus datos musicales desde la API de Spotify.

### Servicio de Géneros
- **Funcionalidad**: Obtiene los géneros más escuchados del usuario.
- **Tecnologías Utilizadas**: Node.js, Express, Axios, CORS.
- **Descripción**: Este servicio analiza los géneros de los artistas más escuchados por el usuario y devuelve una lista ordenada de estos géneros.

### Servicio de Archivos Estáticos
- **Funcionalidad**: Sirve archivos estáticos, como HTML, CSS y JavaScript.
- **Tecnologías Utilizadas**: Node.js, Express, Morgan, Express-Rate-Limit.
- **Descripción**: Este servicio se encarga de servir la interfaz de usuario desde la carpeta `public`.

## Inyección de Fallos y Resiliencia

### Inyección de Fallos
La inyección de fallos se implementa mediante un middleware que simula fallos en el sistema de manera controlada.

### Servicios y Funcionalidades
- **Servicio de Autenticación**:
  - Descripción de su funcionalidad.
  - Tecnologías utilizadas.
  - Flujo de autenticación con Spotify.
- **Servicio de Datos del Usuario**:
  - Descripción de su funcionalidad.
  - Tecnologías utilizadas.
  - Cómo se obtienen y manejan los datos del usuario.
- **Servicio de Géneros**:
  - Descripción de su funcionalidad.
  - Tecnologías utilizadas.
  - Cómo se obtienen y manejan los géneros musicales.
- **Servicio de Archivos Estáticos**:
  - Descripción de su funcionalidad.
  - Tecnologías utilizadas.

### Inyección de Fallos y Resiliencia
- Descripción de cómo se implementa la inyección de fallos.
- Ejemplos de manejo de fallos.
- Uso de patrones de resiliencia como Retries y Circuit Breaker.

### Monitoreo y Observabilidad
- Descripción del monitoreo con Prometheus.
