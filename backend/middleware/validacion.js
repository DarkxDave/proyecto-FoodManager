const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para validar resultados de express-validator
 * Devuelve errores 400 con mensajes en español
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mensajes = errors.array().map(e => e.msg).join(', ');
    return res.status(400).json({ mensaje: `Validación fallida: ${mensajes}` });
  }
  next();
};

/**
 * Validaciones para autenticación
 */
const validarLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('contrasena').notEmpty().withMessage('Contraseña requerida'),
  validate
];

const validarRegistro = [
  body('nombre').trim().escape().notEmpty().withMessage('Nombre requerido').isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('contrasena').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('telefono').optional().trim().escape().isLength({ max: 30 }).withMessage('Teléfono muy largo'),
  validate
];

/**
 * Validaciones para productos
 */
const validarCrearProducto = [
  body('sku').trim().escape().notEmpty().withMessage('SKU requerido').isLength({ min: 3, max: 64 }).withMessage('SKU debe tener entre 3 y 64 caracteres'),
  body('nombre').trim().escape().notEmpty().withMessage('Nombre requerido').isLength({ min: 3, max: 200 }).withMessage('Nombre debe tener entre 3 y 200 caracteres'),
  body('precio').isFloat({ min: 0 }).withMessage('Precio debe ser mayor o igual a 0'),
  body('costo').isFloat({ min: 0 }).withMessage('Costo debe ser mayor o igual a 0'),
  body('codigo_barras').optional().trim().escape().isLength({ max: 64 }).withMessage('Código de barras muy largo'),
  body('descripcion').optional().trim().escape().isLength({ max: 5000 }).withMessage('Descripción muy larga'),
  validate
];

const validarActualizarProducto = [
  param('id').isInt({ min: 1 }).withMessage('ID de producto inválido'),
  body('sku').optional().trim().escape().isLength({ min: 3, max: 64 }).withMessage('SKU debe tener entre 3 y 64 caracteres'),
  body('nombre').optional().trim().escape().isLength({ min: 3, max: 200 }).withMessage('Nombre debe tener entre 3 y 200 caracteres'),
  body('precio').optional().isFloat({ min: 0 }).withMessage('Precio debe ser mayor o igual a 0'),
  body('costo').optional().isFloat({ min: 0 }).withMessage('Costo debe ser mayor o igual a 0'),
  body('descripcion').optional().trim().escape().isLength({ max: 5000 }).withMessage('Descripción muy larga'),
  validate
];

/**
 * Validaciones para usuarios
 */
const validarCrearUsuario = [
  body('nombre').trim().escape().notEmpty().withMessage('Nombre requerido').isLength({ min: 2, max: 100 }).withMessage('Nombre entre 2 y 100 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('contrasena').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('telefono').optional().trim().escape().isLength({ max: 30 }).withMessage('Teléfono muy largo'),
  validate
];

const validarActualizarUsuario = [
  param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('nombre').optional().trim().escape().isLength({ min: 2, max: 100 }).withMessage('Nombre entre 2 y 100 caracteres'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('telefono').optional().trim().escape().isLength({ max: 30 }).withMessage('Teléfono muy largo'),
  validate
];

/**
 * Validaciones para órdenes
 */
const validarCrearOrden = [
  body('id_proveedor').isInt({ min: 1 }).withMessage('ID de proveedor inválido'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal debe ser mayor o igual a 0'),
  body('impuestos').isFloat({ min: 0 }).withMessage('Impuestos debe ser mayor o igual a 0'),
  body('total').isFloat({ min: 0 }).withMessage('Total debe ser mayor o igual a 0'),
  body('codigo').optional().trim().escape().isLength({ max: 50 }).withMessage('Código muy largo'),
  validate
];

/**
 * Validaciones genéricas
 */
const validarId = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  validate
];

const validarPaginacion = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser mayor o igual a 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  validate
];

module.exports = {
  validate,
  validarLogin,
  validarRegistro,
  validarCrearProducto,
  validarActualizarProducto,
  validarCrearUsuario,
  validarActualizarUsuario,
  validarCrearOrden,
  validarId,
  validarPaginacion
};
