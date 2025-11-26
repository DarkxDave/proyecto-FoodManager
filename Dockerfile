# Frontend Angular + Ionic
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Build para producción
RUN npm run build -- --configuration production

# Servidor nginx para servir la app
FROM nginx:alpine

# Copiar build al directorio de nginx
COPY --from=builder /app/www /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
