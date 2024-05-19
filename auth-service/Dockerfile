# Utiliza la imagen oficial de Node.js como imagen base
FROM node:14.17.0

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos necesarios e instala las dependencias del proyecto
COPY package*.json ./
RUN npm install

# Copia los archivos y directorios restantes al directorio de trabajo actual
COPY . .

# Exponer el puerto que la aplicación utiliza
EXPOSE 3000

# Define el comando que ejecuta la aplicación
CMD [ "node", "auth-service.js" ]
