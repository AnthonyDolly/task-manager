FROM node:lts-alpine

WORKDIR /app

# Instala dependencias (incluyendo dev)
COPY package*.json ./
RUN npm ci

# Copia código fuente y configs necesarias
COPY tsconfig*.json ./
COPY nodemon.json ./
COPY src ./src

# Variables y puertos por defecto
ENV PORT=3000
EXPOSE 3000

# Inicia la app con hot-reload (nodemon + ts-node)
CMD ["npm", "run", "dev"]