# proyecto-FoodManager

Sistema de gestión para supermercado con autenticación JWT, gestión de almacenes, inventario y ventas.

## Stack Tecnológico

- **Frontend**: Angular 20 + Ionic 8 + TypeScript
- **Backend**: Node.js + Express 5 + MySQL/MariaDB
- **Autenticación**: JWT (JSON Web Tokens)
- **Base de datos**: MySQL 8.0

## Instalación y Ejecución

### Opción 1: Con Docker (Recomendado)

**Requisitos**: Docker y Docker Compose instalados.

1. Clonar el repositorio y entrar al directorio:
```bash
git clone https://github.com/DarkxDave/proyecto-FoodManager.git
cd proyecto-FoodManager
```

2. Crear archivo `.env` en la raíz (opcional, ya tiene valores por defecto):
```env
DB_ROOT_PASSWORD=rootpassword
DB_USER=admin
DB_PASSWORD=adminpassword
DB_NAME=supermercado
JWT_SECRET=tu-secreto-jwt-muy-largo-y-aleatorio
```

3. Levantar todos los servicios:
```bash
docker-compose up -d
```

4. Acceder a la aplicación:
   - **Frontend**: http://localhost:8080
   - **Backend API**: http://localhost:3000
   - **MySQL**: localhost:3306

5. Ver logs en tiempo real:
```bash
docker-compose logs -f
```

6. Detener los servicios:
```bash
docker-compose down
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

## Comandos Docker Útiles

```bash
# Levantar stack
docker-compose up -d

# Detener stack
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Conectar a MySQL dentro del contenedor
docker-compose exec db mysql -u admin -p

# Reconstruir imágenes
docker-compose build --no-cache
```

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
