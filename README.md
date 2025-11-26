# proyecto-FoodManager

Sistema de gestión para supermercado con autenticación JWT, gestión de almacenes, inventario y ventas.

## Stack Tecnológico

- **Frontend**: Angular 20 + Ionic 8 + TypeScript
- **Backend**: Node.js + Express 5 + MySQL/MariaDB
- **Autenticación**: JWT (JSON Web Tokens)
- **Base de datos**: MySQL 8.0

## Instalación y Ejecución

### Opción 1: Con Docker (Recomendado para Producción)

**Requisitos**: Docker y Docker Compose instalados.

#### Pasos:

1. **Clonar el repositorio**:
```bash
git clone https://github.com/DarkxDave/proyecto-FoodManager.git
cd proyecto-FoodManager
```

2. **Configurar variables de entorno**:
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env y configurar valores seguros (especialmente JWT_SECRET)
# Para generar JWT_SECRET seguro:
# openssl rand -hex 64
```

Ejemplo de `.env`:
```env
DB_ROOT_PASSWORD=tu-password-root-seguro
DB_USER=admin
DB_PASSWORD=tu-password-admin-seguro
DB_NAME=supermercado
JWT_SECRET=tu-jwt-secret-generado-con-openssl-rand-hex-64
```

3. **Opción A - Script de Despliegue Rápido (Recomendado)**:

**Linux/Mac/Git Bash**:
```bash
# Dar permisos de ejecución
chmod +x deploy.sh

# Iniciar servicios
./deploy.sh start

# Otros comandos disponibles:
./deploy.sh stop      # Detener servicios
./deploy.sh restart   # Reiniciar servicios
./deploy.sh logs      # Ver logs en tiempo real
./deploy.sh rebuild   # Reconstruir imágenes
./deploy.sh clean     # Limpiar todo (incluye datos)
./deploy.sh status    # Ver estado de servicios
```

**Windows PowerShell**:
```powershell
# Iniciar servicios
.\deploy.ps1 start

# Otros comandos disponibles:
.\deploy.ps1 stop      # Detener servicios
.\deploy.ps1 restart   # Reiniciar servicios
.\deploy.ps1 logs      # Ver logs en tiempo real
.\deploy.ps1 rebuild   # Reconstruir imágenes
.\deploy.ps1 clean     # Limpiar todo (incluye datos)
.\deploy.ps1 status    # Ver estado de servicios
```

**Opción B - Docker Compose Manual**:
```bash
# Levantar todos los servicios
docker-compose up -d
```

Este comando:
- Descarga las imágenes de MySQL, Node y Nginx
- Construye las imágenes del backend y frontend
- Crea la base de datos e inicializa con esquema y datos
- Levanta todos los servicios en segundo plano

4. **Verificar que los servicios están corriendo**:
```bash
docker-compose ps
```

Deberías ver:
- `supermercado_db` (MySQL)
- `supermercado_backend` (Node.js/Express)
- `supermercado_frontend` (Nginx)

5. **Acceder a la aplicación**:
   - **Frontend**: http://localhost:8080
   - **Backend API**: http://localhost:3000
   - **MySQL**: localhost:3306

6. **Credenciales por defecto**:
   - Email: `admin@supermercado.com`
   - Contraseña: `admin123`

#### Comandos útiles de Docker:

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Detener los servicios (conserva datos)
docker-compose stop

# Iniciar servicios detenidos
docker-compose start

# Reiniciar servicios
docker-compose restart

# Detener y eliminar contenedores (conserva volúmenes/datos)
docker-compose down

# Detener y eliminar TODO (incluye volúmenes/datos)
docker-compose down -v

# Reconstruir imágenes (después de cambios en código)
docker-compose build --no-cache
docker-compose up -d

# Ejecutar comando en contenedor (ej: acceder a MySQL)
docker-compose exec db mysql -u admin -p
docker-compose exec backend sh
docker-compose exec frontend sh

# Ver uso de recursos
docker stats
```

#### Solución de problemas:

**Puerto ocupado**:
```bash
# Cambiar puertos en docker-compose.yml o .env
# Ej: "8081:80" en vez de "8080:80" para frontend
```

**Base de datos no inicializa**:
```bash
# Eliminar volumen y volver a crear
docker-compose down -v
docker-compose up -d
```

**Cambios en código no se reflejan**:
```bash
# Reconstruir imágenes
docker-compose build --no-cache
docker-compose up -d
```

### Opción 2: Instalación Local (Sin Docker)

#### Backend

1. Instalar dependencias:
```bash
cd backend
npm install
```

2. Configurar `.env` (copiar desde `.env.example`):
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=supermercado
PORT=3000
JWT_SECRET=genera-uno-con-comando-abajo
```

3. Generar JWT_SECRET seguro:
```bash
# Opción 1: Terminal Node
node
> require('crypto').randomBytes(64).toString('hex')

# Opción 2: OpenSSL (Linux/Mac/Git Bash)
openssl rand -hex 64

# Opción 3: PowerShell
[System.BitConverter]::ToString((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(64)) -replace '-'
```
Copiar el token generado y pegarlo en `JWT_SECRET` del archivo `.env`.

4. Crear la base de datos en MySQL:
```sql
CREATE DATABASE supermercado CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

5. Importar el esquema:
```bash
# Desde la raíz del proyecto
mysql -u root -p supermercado < backend/database/supermercado.sql
```

6. Iniciar el servidor:
```bash
node index.js
```

#### Frontend

1. Instalar dependencias (desde la raíz):
```bash
npm install
```

2. Configurar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000'
};
```

3. Iniciar servidor de desarrollo:
```bash
npm start
# o también: ionic serve
```

4. Abrir http://localhost:4200

## API Endpoints

### Autenticación (`/api/auth`)
- `POST /register` - Registro de usuario (rol: usuario)
- `POST /login` - Inicio de sesión (devuelve JWT)
- `GET /me` - Datos del usuario autenticado (requiere token)
- `GET /health` - Estado de la conexión DB

### Almacenes (`/api/almacenes`)
- `GET /` - Listar almacenes (requiere token)
- `POST /` - Crear almacén (requiere token + rol admin)
- `PUT /:id` - Actualizar almacén (requiere token + rol admin)
- `DELETE /:id` - Eliminar almacén (requiere token + rol admin)
- `GET /:id/metrics` - Métricas del almacén (requiere token)
- `GET /:id/sse` - Stream en tiempo real (SSE)

## Autenticación y Roles

- **Registro público**: siempre asigna rol `usuario`
- **Rol admin**: debe ser asignado manualmente en la base de datos
- **Token JWT**: incluye payload `{ sub: id_usuario, email, rol }`
- **Expiración**: 8 horas desde emisión

Para convertir un usuario en admin:
```sql
UPDATE usuarios u 
JOIN roles r ON r.nombre_rol='admin' 
SET u.id_rol=r.id_rol 
WHERE u.email='tu@email.com';
```

## Seguridad Implementada

El proyecto incorpora las siguientes medidas de seguridad para cumplir con los requisitos de producción:

### 1. Protección de Cabeceras HTTP (Helmet)
- **Helmet** configurado en `backend/index.js` para establecer cabeceras HTTP seguras
- `X-Content-Type-Options: nosniff` - Previene MIME type sniffing
- `X-Frame-Options: DENY` - Protege contra clickjacking
- `X-XSS-Protection: 1; mode=block` - Activa filtro XSS del navegador
- CSP desactivado en desarrollo para evitar conflictos con herramientas de debugging

### 2. Limitación de Tasa (Rate Limiting)
Protección contra ataques de fuerza bruta y DDoS mediante `express-rate-limit`:

**Limitador Global:**
- 100 peticiones por cada 15 minutos por IP
- Aplica a todos los endpoints de la API
- Mensaje: "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde"

**Limitador de Autenticación:**
- 5 intentos por cada 15 minutos por IP
- Aplica a `/api/auth/login` y `/api/auth/register`
- Mensaje: "Demasiados intentos de inicio de sesión, intenta más tarde"

### 3. Validación y Sanitización de Entradas (Express-Validator)
Middleware `backend/middleware/validacion.js` con validaciones para:

**Autenticación:**
- Email validado con formato correcto y normalizado
- Contraseñas mínimo 6 caracteres
- Nombres y teléfonos con escape XSS y límites de longitud

**Productos:**
- SKU y nombre requeridos con longitudes específicas (3-64 y 3-200)
- Precios y costos validados como números flotantes >= 0
- Descripciones con escape XSS y límite de 5000 caracteres
- Sanitización con `trim()` y `escape()` en todos los campos de texto

**Usuarios:**
- Email único validado y normalizado
- Nombres entre 2-100 caracteres con escape XSS
- Verificación de existencia antes de actualizar

**Órdenes de Compra:**
- ID de proveedor validado como entero positivo
- Subtotal, impuestos y total validados como flotantes >= 0
- Códigos de orden con escape XSS

### 4. Protección contra SQL Injection
- Todas las consultas utilizan **consultas parametrizadas** (prepared statements)
- No se concatenan valores de usuario directamente en strings SQL
- Uso consistente de arrays de parámetros en `db.query(sql, [params])`

### 5. Autenticación Segura
- Contraseñas hasheadas con **bcrypt** (factor de costo 10)
- Tokens JWT con secreto fuerte (`JWT_SECRET` en `.env`)
- Middleware `auth.js` verifica token en rutas protegidas
- Nunca se devuelven ni registran contraseñas (ni hasheadas)

### 6. Control de Acceso Basado en Roles (RBAC)
- Verificación de rol admin en operaciones de escritura críticas
- Endpoints de creación/edición/eliminación restringidos por rol
- Registro público forzado a rol `usuario` (no aceptado desde cliente)

### Configuración de Seguridad

Para entorno de producción, asegurar:
```env
# .env
JWT_SECRET=token-aleatorio-de-64-caracteres-minimo
DB_PASSWORD=contraseña-fuerte-para-mysql
NODE_ENV=production
```

Recomendaciones adicionales para producción:
- Habilitar HTTPS con certificado SSL/TLS
- Configurar CORS con origen específico (no `*`)
- Implementar logging de intentos fallidos
- Configurar backup automático de base de datos
- Revisar y actualizar dependencias regularmente con `npm audit`

## Comandos Docker Útiles

### Scripts Incluidos

El proyecto incluye scripts de ayuda para facilitar operaciones comunes:

**`deploy.sh` / `deploy.ps1`**: Gestión de servicios Docker
**`backup.sh` / `backup.ps1`**: Backup automático de base de datos

```bash
# Linux/Mac/Git Bash
./backup.sh              # Crear backup de MySQL
chmod +x backup.sh       # Dar permisos si es necesario

# Windows PowerShell
.\backup.ps1             # Crear backup de MySQL
```

Los backups se guardan en `./backups/` con formato `db_supermercado_YYYYMMDD_HHMMSS.sql.gz`

### Comandos Docker Compose

```bash
# Levantar stack completo
docker-compose up -d

# Detener stack (conserva datos)
docker-compose down

# Detener y eliminar TODO incluido volúmenes
docker-compose down -v

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reiniciar servicios
docker-compose restart

# Conectar a MySQL dentro del contenedor
docker-compose exec db mysql -u admin -p

# Acceder a shell del backend
docker-compose exec backend sh

# Reconstruir imágenes (después de cambios)
docker-compose build --no-cache
docker-compose up -d

# Ver estado de servicios
docker-compose ps

# Ver uso de recursos
docker stats
```

📘 **Para más detalles sobre Docker, consulta [DOCKER.md](DOCKER.md)**

## Arquitectura de Despliegue Docker

```
┌─────────────────────────────────────────────┐
│           Docker Compose Stack              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   Frontend   │  │   Backend    │        │
│  │   (Nginx)    │  │ (Node/Express)│       │
│  │  Port: 8080  │  │  Port: 3000  │        │
│  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                 │
│         └────────┬────────┘                 │
│                  │                          │
│         ┌────────▼────────┐                 │
│         │   MySQL 8.0     │                 │
│         │  Port: 3306     │                 │
│         │  Volume: db_data│                 │
│         └─────────────────┘                 │
│                                             │
│  Network: app-network (bridge)              │
└─────────────────────────────────────────────┘
```

## Seguridad

El proyecto implementa las siguientes medidas de seguridad:

### 1. Autenticación y Autorización
- **JWT (JSON Web Tokens)**: Autenticación stateless con tokens firmados
- **Bcrypt**: Hashing de contraseñas con 10 rounds de salt
- **RBAC**: Control de acceso basado en roles (admin, editor, visualizador, usuario)
- **Expiración de tokens**: 8 horas de validez

### 2. Protección de Cabeceras HTTP (Helmet)
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY (protección contra clickjacking)
- **X-XSS-Protection**: habilitado
- **Strict-Transport-Security**: HTTPS enforcement (producción)
- **CSP**: Content Security Policy (desactivado en desarrollo)

### 3. Rate Limiting
- **Global**: 100 requests por 15 minutos por IP
- **Autenticación**: 5 intentos por 15 minutos en `/login` y `/register`
- Protección contra brute force y ataques DDoS

### 4. Validación y Sanitización de Entradas
- **Express-validator**: Validación de todos los inputs en rutas críticas
- **Sanitización XSS**: `trim()` y `escape()` en campos de texto
- **Normalización**: Emails normalizados para consistencia
- **Validación de tipos**: Enteros, floats, longitudes, formatos
- Mensajes de error en español

### 5. Protección SQL Injection
- **Consultas parametrizadas**: Todas las queries usan placeholders `?`
- **Prepared statements**: MySQL2 con soporte nativo
- No concatenación de strings en SQL

### 6. Mejores Prácticas
- Variables sensibles en `.env` (no versionadas)
- Secrets generados con `openssl rand -hex 64`
- Usuario no-root en contenedores Docker
- Health checks en servicios
- Logs sin información sensible

### Configuración para Producción
1. **HTTPS**: Configurar certificado SSL/TLS en Nginx
2. **JWT_SECRET**: Generar nuevo secret con `openssl rand -hex 64`
3. **Contraseñas DB**: Cambiar todos los passwords por defecto
4. **CSP**: Habilitar Content Security Policy en Helmet
5. **CORS**: Configurar origins permitidos específicos
6. **Logs**: Implementar rotación de logs con Winston o similar
7. **Monitoring**: Configurar Prometheus/Grafana para métricas
8. **Backups**: Automatizar backups de volumen `db_data`

## Cambios realizados
- Se creó el servidor mediante Express en la carpeta: backend.

- En la misma carpeta Backend se configuró la conexión con el login.

- Se definieron los observables para el login y registro de usuarios en backend/services.

- Se establecieron las autenticaciones con JWT en la carpeta app/routes.

- Se actualizó el apartado de bodegas para que se mostraran los cambios en este campo y se reflejaran en la base de datos.


## Base de datos

- Se creó la base de datos utilizando MySQL

- Se utilizó mariadb para correr el servidor de base de datos.


- Modelo:
<img width="4860" height="3164" alt="Image" src="https://github.com/user-attachments/assets/08b6fc08-94b4-469f-a0b0-f4b729749359" />


## Pruebas en PostMan:
<img width="920" height="510" alt="Image" src="https://github.com/user-attachments/assets/18706aac-13d8-440f-b705-90d187a51eca" />

<img width="671" height="400" alt="Image" src="https://github.com/user-attachments/assets/737623b5-0f0d-4fe3-9f8f-ceeb2ae0119c" />
