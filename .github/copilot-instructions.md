# Copilot Instructions for proyecto-FoodManager

These instructions help GitHub Copilot generate code consistent with this repository. Keep responses concise, in Spanish for UI texts/messages, and aligned with the current tech stack.

## Contexto del proyecto
- Frontend: Angular 20 + Ionic 8 (TypeScript)
  - Rutas principales: `/auth`, `/auth/sing-up`, `/auth/forgot-password`, `/dashboard`, `/dashboard/*`
  - Módulos y páginas en `src/app/pages/**`. Componentes compartidos en `src/app/shared/**`.
  - Servicios HTTP en `src/app/shared/services/**`.
  - Interceptor de auth en `src/app/shared/interceptors/auth.interceptor.ts` (adjunta `Authorization: Bearer <token>` si existe).
  - Guard de auth en `src/app/shared/guards/auth.guard.ts`.
  - Config de API: `src/environments/environment(.prod).ts` con `apiBaseUrl`.
  - Componentes compartidos existentes: `app-header`, `app-logo`, `app-custom-input`, `app-admin-sidebar`.
- Backend: Node.js (CommonJS) + Express 5
  - Entrada: `backend/index.js`.
  - Rutas: `backend/routes/*.js` (por ejemplo, `auth.js`, `almacenes.js`).
  - Middleware JWT: `backend/middleware/auth.js`.
  - DB: MySQL/MariaDB via `mysql2/promise` (pool definido en `backend/db.js`).
  - Esquema BD: supermercado (roles, usuarios, almacenes, ubicaciones, productos, stocks, movimientos, órdenes de compra, ventas, clientes).

## Reglas y convenciones
- Idioma de interfaz: Español (por ejemplo, `mensaje: 'Error en el servidor'`).
- Autenticación
  - Usar JWT en `Authorization: Bearer <token>`.
  - Las rutas protegidas usan `auth` middleware.
  - El registro público asigna SIEMPRE rol `usuario` en backend (no aceptar rol del cliente).
  - Acciones de administración (crear/editar/eliminar recursos críticos) deben verificar `rol === 'admin'` desde el token.
- API
  - Prefijo de rutas: `/api/...`.
  - Manejar errores con códigos correctos (400 datos insuficientes, 401 sin token o credenciales inválidas, 403 sin permisos, 404 no encontrado, 409 conflicto, 500 error servidor).
  - Respuestas JSON con claves en español, e.g. `{ mensaje: '...' }` o payloads nombrados.
  - Usar `async/await` y consultas parametrizadas.
- Frontend
  - Formularios reactivos (ReactiveFormsModule) para formularios de autenticación y CRUD.
  - Importar `SharedModule` cuando se usen componentes compartidos (`app-header`, etc.).
  - Usar `environment.apiBaseUrl` para componer URLs a la API.
  - Consumir servicios vía `HttpClient` y `Observable` (rxjs 7.8).
  - Navegación por Router; páginas bajo `pages/**` no son standalone (standalone: false) y pertenecen a su NgModule.
  - Mantener textos y validaciones en español.
- Estilo de código
  - TypeScript con tipos explícitos en servicios y modelos.
  - CommonJS en backend (`module.exports`/`require`).
  - Nombres claros, funciones pequeñas, manejo de errores detallado.

## Pautas de generación
- Al crear nuevas páginas Angular:
  - Crear módulo, routing module y page component bajo `src/app/pages/<feature>/`.
  - Añadir rutas child bajo `/dashboard` cuando corresponda.
  - Incluir ReactiveFormsModule si hay formulario.
  - Usar componentes compartidos si aplica (encabezado, inputs, logo, sidebar).
- Al crear nuevos servicios Angular:
  - Ubicar en `src/app/shared/services/`.
  - Exportar interfaces de tipos (e.g., `Almacen`).
  - Usar `environment.apiBaseUrl` y devolver `Observable<T>`.
- Al crear nuevas rutas backend:
  - Ubicar en `backend/routes/<recurso>.js`.
  - Importar `auth` para proteger endpoints.
  - Validar input (campos requeridos) y devolver mensajes en español.
  - En operaciones de escritura, requerir rol admin.
- Seguridad
  - Nunca registrar ni devolver contraseñas (ni hasheadas).
  - Usar `bcryptjs` para hashing y `jsonwebtoken` para tokens.
  - Leer secretos desde `.env` (`JWT_SECRET`).

## Ejemplos
- Respuesta de error coherente:
  ```json
  { "mensaje": "Faltan datos (nombre, email, contrasena)" }
  ```
- Estructura de servicio Angular (ejemplo genérico):
  ```ts
  @Injectable({ providedIn: 'root' })
  export class RecursoService {
    private baseUrl = environment.apiBaseUrl + '/api/recurso';
    constructor(private http: HttpClient) {}
    listar(): Observable<Item[]> { return this.http.get<Item[]>(this.baseUrl); }
    crear(dto: CreateDto): Observable<{ mensaje: string }> { return this.http.post<{ mensaje: string }>(this.baseUrl, dto); }
  }
  ```
- Ruta backend con admin requerido:
  ```js
  router.post('/', auth, async (req, res) => {
    if ((req.user.rol || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo administradores' });
    }
    // ...
  });
  ```

## Notas del repositorio
- La ruta de registro en frontend es `/auth/sing-up` (ortografía actual). Mantenerla hasta que se haga el refactor a `sign-up`.
- Tokens se guardan en `localStorage` con clave `auth_token` (ver `AuthService`).
- Para nuevos CRUDs, seguir el patrón ya aplicado en “Bodegas/Almacenes”.

## Qué evitar
- No aceptar rol desde el cliente en `/register`.
- No exponer datos sensibles ni logs con credenciales.
- No usar rutas sin el prefijo `/api/` en backend.
- No hardcodear URLs; usar `environment.apiBaseUrl`.

