const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const almacenesRoutes = require('./routes/almacenes');
const productosRoutes = require('./routes/productos');
const ordenesRoutes = require('./routes/ordenes');
const usuariosRouter = require('./routes/usuarios');
const proveedoresRoutes = require('./routes/proveedores');
const reportesRoutes = require('./routes/reportes');

const app = express();

// Seguridad: Headers HTTP seguros con Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar CSP para desarrollo; activar en producción con configuración específica
  crossOriginEmbedderPolicy: false
}));

// CORS configurado
app.use(cors());

// Body parser
app.use(bodyParser.json());

// Rate limiting global: máximo 100 requests por 15 minutos por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de requests
  message: { mensaje: 'Demasiadas solicitudes desde esta IP, intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Rate limiting estricto para autenticación: 5 intentos por 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { mensaje: 'Demasiados intentos de login, intenta en 15 minutos' },
  skipSuccessfulRequests: true
});

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente 🚀');
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/almacenes', almacenesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/reportes', reportesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor backend corriendo en puerto ${PORT}`));

module.exports = app;
