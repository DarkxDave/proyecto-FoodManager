# Gestión de Usuarios y Roles - Implementación Completa

## ✅ Funcionalidades Implementadas

### Backend (`backend/routes/usuarios.js`)

#### Endpoints disponibles (todos requieren autenticación y rol admin):

1. **GET `/api/usuarios`** - Listar usuarios con paginación
   - Query params: `q` (búsqueda), `rol` (filtro), `page`, `limit`
   - Retorna: lista de usuarios con paginación

2. **GET `/api/usuarios/roles/list`** - Listar roles disponibles
   - Retorna: array de roles (id_rol, nombre_rol)

3. **GET `/api/usuarios/:id`** - Detalle de un usuario
   - Retorna: usuario completo con rol

4. **POST `/api/usuarios`** - Crear nuevo usuario
   - Body: `{ nombre, email, telefono?, contrasena, id_rol }`
   - Valida email único
   - Hash de contraseña con bcrypt

5. **PUT `/api/usuarios/:id`** - Actualizar usuario
   - Body: `{ nombre?, email?, telefono?, activo? }`
   - No permite cambiar contraseña (usar endpoint específico si necesario)

6. **PUT `/api/usuarios/:id/rol`** - Cambiar rol de usuario
   - Body: `{ id_rol }`
   - Protección: admin no puede quitarse su propio rol

7. **DELETE `/api/usuarios/:id`** - Eliminar usuario (lógico)
   - Marca `activo = 0`
   - Protección: admin no puede eliminarse a sí mismo

### Frontend

#### Servicio Angular (`src/app/shared/services/usuarios.service.ts`)
- Interfaces: `Usuario`, `Rol`, `UsuariosResponse`, `CrearUsuarioDto`, `ActualizarUsuarioDto`
- Métodos: `listar()`, `detalle()`, `crear()`, `actualizar()`, `cambiarRol()`, `eliminar()`, `listarRoles()`

#### Página de Usuarios (`src/app/pages/dashboard/usuarios.page.*`)

**Características:**
- ✅ Tabla completa con todos los campos de usuario
- ✅ Búsqueda por nombre o email (debounce 300ms)
- ✅ Filtro por rol (dropdown)
- ✅ Paginación (Anterior/Siguiente)
- ✅ Badges coloreados por rol y estado
- ✅ Modal CRUD con validaciones
- ✅ Formulario reactivo (ReactiveFormsModule)
- ✅ Responsive design

**Modal de creación/edición:**
- Campos: nombre, email, teléfono, contraseña (solo crear), rol (select), activo (toggle)
- Validaciones:
  - Nombre: requerido, mínimo 3 caracteres
  - Email: requerido, formato email
  - Contraseña: requerido en creación, mínimo 6 caracteres
  - Rol: requerido (select desde BD)
- Manejo de errores con mensajes en español

**Colores de badges por rol:**
- Admin: danger (rojo)
- Editor: warning (naranja)
- Visualizador: primary (azul)
- Usuario: medium (gris)

## 🔐 Seguridad Implementada

1. **Autenticación JWT**: Todos los endpoints requieren token válido
2. **Autorización por rol**: Solo administradores pueden gestionar usuarios
3. **Validación de entrada**: Sanitización y validación de datos
4. **Protecciones especiales**:
   - Admin no puede quitarse su propio rol de admin
   - Admin no puede eliminarse a sí mismo
   - Email único (validación en BD)
   - Contraseñas hasheadas con bcrypt (salt 10)

## 🎯 Requerimientos Funcionales Cubiertos

- [x] Listar usuarios con búsqueda y filtros
- [x] Crear nuevos usuarios con asignación de rol
- [x] Editar información de usuarios
- [x] Cambiar rol de usuarios
- [x] Eliminar usuarios (lógico)
- [x] Activar/desactivar usuarios
- [x] Validaciones de formulario
- [x] Manejo de errores y feedback

## 🛠️ Requerimientos No Funcionales

- [x] **Usabilidad**: Interfaz intuitiva con tablas, filtros y modal
- [x] **Rendimiento**: Paginación en backend, debounce en búsqueda
- [x] **Seguridad**: JWT, bcrypt, validaciones, protecciones de auto-modificación
- [x] **Mantenibilidad**: Código modular, tipado fuerte, comentarios
- [x] **Responsive**: Diseño adaptable a móviles
- [x] **Feedback**: Mensajes de error/éxito en español

## 📦 Acceso a Bodegas para Admin

Los endpoints de almacenes ya están correctamente configurados:
- **GET `/api/almacenes`**: Accesible para cualquier usuario autenticado
- **POST/PUT/DELETE `/api/almacenes`**: Solo admin
- **GET `/api/almacenes/:id/metrics`**: Accesible para cualquier usuario autenticado
- **GET `/api/almacenes/:id/sse`**: Accesible para cualquier usuario autenticado

El sidebar ya incluye el enlace "Bodegas" visible solo para admin.

## 🚀 Cómo usar

### Backend
```bash
cd backend
node index.js
```

### Frontend
```bash
ionic serve
```

### Acceso
1. Login como admin
2. Ir a sidebar → "Usuarios"
3. Gestionar usuarios: crear, editar, cambiar roles, eliminar

## 📝 Notas Técnicas

- Base de datos: MySQL/MariaDB
- Roles disponibles: admin, editor, visualizador, usuario
- Paginación por defecto: 10 usuarios por página
- Búsqueda case-insensitive en nombre y email
- Eliminación lógica: `activo = 0` en lugar de DELETE físico
