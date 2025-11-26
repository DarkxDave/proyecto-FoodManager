# Backend Node.js
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código fuente
COPY . .

# Exponer puerto del servidor
EXPOSE 3000

# Comando de inicio
CMD ["node", "index.js"]
