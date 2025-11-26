# 🐳 Guía de Despliegue con Docker

Documentación completa para desplegar **proyecto-FoodManager** usando Docker y Docker Compose.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Inicio Rápido](#inicio-rápido)
- [Arquitectura](#arquitectura)
- [Configuración](#configuración)
- [Comandos Útiles](#comandos-útiles)
- [Solución de Problemas](#solución-de-problemas)
- [Producción](#producción)

## Requisitos

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Puertos disponibles**: 3000 (backend), 3306 (MySQL), 8080 (frontend)

### Instalar Docker

**Windows/Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux (Ubuntu/Debian)**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Verificar instalación**:
```bash
docker --version
docker-compose --version
```

## Inicio Rápido

### 1. Clonar y configurar

```bash
git clone https://github.com/DarkxDave/proyecto-FoodManager.git
cd proyecto-FoodManager

# Copiar variables de entorno
cp .env.example .env

# Editar .env (cambiar JWT_SECRET en producción)
nano .env  # o vim, code, etc.
```

### 2. Desplegar con script

**Linux/Mac/Git Bash**:
```bash
chmod +x deploy.sh
./deploy.sh start
```

**Windows PowerShell**:
```powershell
.\deploy.ps1 start
```

### 3. Acceder a la aplicación

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **Credenciales**: `admin@supermercado.com` / `admin123`

## Arquitectura

```
┌─────────────────────────────────────────────┐
│           Docker Compose Stack              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   Frontend   │  │   Backend    │        │
│  │ nginx:alpine │  │ node:20-alpine│       │
│  │  Port: 8080  │  │  Port: 3000  │        │
│  │              │  │              │        │
│  │ /www (build) │  │ /app (code)  │        │
│  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                 │
│         └────────┬────────┘                 │
│                  │                          │
│         ┌────────▼────────┐                 │
│         │   MySQL 8.0     │                 │
│         │  Port: 3306     │                 │
│         │                 │                 │
│         │ Volumes:        │                 │
│         │ - db_data       │                 │
│         │ - init.sql      │                 │
│         │ - seeds         │                 │
│         └─────────────────┘                 │
│                                             │
│  Network: app-network (bridge)              │
│  Volumes: db_data, backend_exports          │
└─────────────────────────────────────────────┘
```

### Servicios

| Servicio | Imagen | Puerto | Descripción |
|----------|--------|--------|-------------|
| `frontend` | nginx:alpine | 8080 | SPA Angular/Ionic |
| `backend` | node:20-alpine | 3000 | API REST Express |
| `db` | mysql:8.0 | 3306 | Base de datos |

## Configuración

### Variables de Entorno (`.env`)

```env
# MySQL
DB_ROOT_PASSWORD=rootpassword
DB_USER=admin
DB_PASSWORD=adminpassword
DB_NAME=supermercado

# Backend JWT
JWT_SECRET=cambiar-en-produccion-usar-openssl-rand-hex-64

# Puertos (opcional, cambiar si hay conflictos)
# MYSQL_PORT=3306
# BACKEND_PORT=3000
# FRONTEND_PORT=8080
```

### Generar JWT_SECRET Seguro

```bash
# Opción 1: OpenSSL
openssl rand -hex 64

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opción 3: PowerShell
[System.BitConverter]::ToString((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(64)) -replace '-'
```

## Comandos Útiles

### Scripts de Despliegue

```bash
# Linux/Mac/Git Bash
./deploy.sh start      # Iniciar servicios
./deploy.sh stop       # Detener servicios
./deploy.sh restart    # Reiniciar servicios
./deploy.sh logs       # Ver logs en tiempo real
./deploy.sh rebuild    # Reconstruir imágenes
./deploy.sh clean      # Eliminar TODO (datos incluidos)
./deploy.sh status     # Ver estado de servicios

# Windows PowerShell
.\deploy.ps1 start
.\deploy.ps1 stop
# ... mismos comandos
```

### Docker Compose Manual

```bash
# Iniciar servicios en segundo plano
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Detener servicios (conserva datos)
docker-compose stop

# Iniciar servicios detenidos
docker-compose start

# Reiniciar servicios
docker-compose restart

# Detener y eliminar contenedores (conserva volúmenes)
docker-compose down

# Detener y eliminar TODO (incluye volúmenes/datos)
docker-compose down -v

# Reconstruir imágenes sin caché
docker-compose build --no-cache

# Ver estado de servicios
docker-compose ps

# Ver uso de recursos
docker stats
```

### Acceder a Contenedores

```bash
# MySQL
docker-compose exec db mysql -u admin -p
# Password: valor de DB_PASSWORD en .env

# Backend (shell)
docker-compose exec backend sh

# Frontend (shell)
docker-compose exec frontend sh

# Ejecutar comando en backend
docker-compose exec backend npm --version
docker-compose exec backend node -v
```

### Gestión de Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen de base de datos
docker volume inspect proyecto-foodmanager_db_data

# Backup de base de datos
docker-compose exec db mysqldump -u admin -p supermercado > backup.sql

# Restaurar base de datos
cat backup.sql | docker-compose exec -T db mysql -u admin -p supermercado
```

## Solución de Problemas

### Puerto Ocupado

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solución**:
```bash
# Ver qué proceso usa el puerto
# Linux/Mac
lsof -i :3000
netstat -ano | findstr :3000  # Windows

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # En vez de "3000:3000"
```

### Base de Datos No Inicializa

**Síntomas**: Backend no puede conectar a MySQL

**Solución**:
```bash
# Ver logs de MySQL
docker-compose logs db

# Eliminar volumen y reiniciar
docker-compose down -v
docker-compose up -d

# Esperar a que el healthcheck pase
docker-compose ps
```

### Cambios en Código No Se Reflejan

**Problema**: Editaste código pero no ves los cambios

**Solución**:
```bash
# Reconstruir imágenes
docker-compose build --no-cache

# Reiniciar servicios
docker-compose up -d
```

### Errores de Permisos (Linux)

**Error**: `permission denied` al ejecutar deploy.sh

**Solución**:
```bash
chmod +x deploy.sh
./deploy.sh start
```

### Frontend Muestra 404

**Problema**: http://localhost:8080 muestra página en blanco o 404

**Verificar**:
1. Build de Angular completado: `docker-compose logs frontend`
2. Archivos en `/usr/share/nginx/html`: `docker-compose exec frontend ls /usr/share/nginx/html`
3. Nginx configurado correctamente: `docker-compose exec frontend cat /etc/nginx/conf.d/default.conf`

### Backend No Responde

**Verificar**:
```bash
# Health check
curl http://localhost:3000/api/auth/health

# Ver logs
docker-compose logs backend

# Verificar conexión a MySQL
docker-compose exec backend sh
nc -zv db 3306
```

## Producción

### Checklist de Seguridad

- [ ] **JWT_SECRET**: Generado con `openssl rand -hex 64`
- [ ] **Contraseñas DB**: Todas cambiadas desde valores por defecto
- [ ] **HTTPS**: Certificado SSL configurado en Nginx
- [ ] **Firewall**: Solo puertos necesarios expuestos
- [ ] **Secrets**: No versionados en Git (.env en .gitignore)
- [ ] **CSP**: Content Security Policy habilitado en Helmet
- [ ] **CORS**: Origins específicos configurados
- [ ] **Rate Limiting**: Ajustado según tráfico esperado
- [ ] **Logs**: Rotación configurada (logrotate)
- [ ] **Backups**: Automatizados con cron
- [ ] **Monitoring**: Prometheus/Grafana configurado
- [ ] **Updates**: Dependencias actualizadas

### Configuración HTTPS con Let's Encrypt

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com

# Configurar renovación automática
sudo certbot renew --dry-run
```

### Backups Automáticos

```bash
# Agregar a crontab (crontab -e)
0 2 * * * /ruta/proyecto/backup.sh
```

Crear `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR=/var/backups/supermercado
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de MySQL
docker-compose exec -T db mysqldump -u admin -p$DB_PASSWORD supermercado > $BACKUP_DIR/db_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/db_$DATE.sql

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Monitoreo con Docker Stats

```bash
# Ver uso de recursos en tiempo real
docker stats

# Exportar métricas
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Logs en Producción

Configurar rotación de logs en `docker-compose.yml`:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Recursos Adicionales

- [Documentación Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [MySQL en Docker](https://hub.docker.com/_/mysql)
- [Nginx en Docker](https://hub.docker.com/_/nginx)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Soporte

Si encuentras problemas:

1. Revisa logs: `docker-compose logs -f`
2. Verifica estado: `docker-compose ps`
3. Revisa esta guía de solución de problemas
4. Abre un issue en GitHub

---

**Última actualización**: Noviembre 2025
