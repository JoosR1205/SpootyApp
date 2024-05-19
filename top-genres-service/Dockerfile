FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002
CMD ["node", "top-genres-service.js"]
