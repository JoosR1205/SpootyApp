
# Proyecto SpotyApp

## Introducción
SpotyApp es una aplicación que permite a los usuarios autenticarse con Spotify y ver sus artistas, canciones y géneros más escuchados. El objetivo del proyecto es proporcionar una interfaz sencilla y eficiente para que los usuarios puedan explorar su actividad musical en Spotify.

## Arquitectura del Proyecto
La arquitectura del proyecto está basada en microservicios, donde cada servicio tiene una responsabilidad específica y se comunica con los demás servicios a través de APIs REST.

### Diagrama de Arquitectura
![Diagrama de Arquitectura](ruta/a/tu/diagrama.png)

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

## Presentación del Proyecto

### Introducción
- Introducción al proyecto.
- Objetivos del proyecto.

### Arquitectura del Proyecto
- Descripción general de la arquitectura del sistema.
- Diagrama de arquitectura.

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
- Ejemplos de métricas recolectadas.
- Cómo se configuran las alertas.

### Guía de Despliegue
- Paso a paso de cómo clonar, configurar y desplegar el proyecto.
- Demostración en vivo (opcional).

### Conclusiones y Próximos Pasos
- Resumen de lo aprendido.
- Posibles mejoras y funcionalidades futuras.
