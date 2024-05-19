# Utiliza la imagen oficial de Node.js como imagen base
FROM node:14

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar los archivos del proyecto
COPY . .

# Exponer el puerto que el servidor utilizará
EXPOSE 3003

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]
