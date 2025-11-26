# Backend Node.js
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (npm ci es más rápido y determinista)
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio para exports de reportes
RUN mkdir -p exports && chown -R node:node /app

# Usar usuario no-root por seguridad
USER node

# Exponer puerto del servidor
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/auth/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "index.js"]
