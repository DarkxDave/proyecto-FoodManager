-- Script de inicialización completo para Docker
-- Combina esquema + datos iniciales
-- Se ejecuta automáticamente al crear el contenedor de MySQL

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- CREACIÓN DE TABLAS
-- --------------------------------------------------------

-- Roles (admin, editor, visualizador, usuario)
CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uk_roles_nombre` (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Usuarios del sistema
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(30) DEFAULT NULL,
  `contrasena` VARCHAR(255) NOT NULL,
  `id_rol` INT(11) NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_usuarios_email` (`email`),
  KEY `idx_usuarios_rol` (`id_rol`),
  CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id_cliente` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `telefono` VARCHAR(30) DEFAULT NULL,
  `documento` VARCHAR(50) DEFAULT NULL,
  `direccion` VARCHAR(200) DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_cliente`),
  KEY `idx_clientes_email` (`email`),
  KEY `idx_clientes_documento` (`documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Almacenes o Bodegas
CREATE TABLE IF NOT EXISTS `almacenes` (
  `id_almacen` INT(11) NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(20) DEFAULT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `direccion` VARCHAR(200) DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_almacen`),
  UNIQUE KEY `uk_almacenes_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ubicaciones dentro de almacenes
CREATE TABLE IF NOT EXISTS `ubicaciones` (
  `id_ubicacion` INT(11) NOT NULL AUTO_INCREMENT,
  `id_almacen` INT(11) NOT NULL,
  `codigo` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(150) DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_ubicacion`),
  UNIQUE KEY `uk_ubicaciones_codigo_almacen` (`id_almacen`, `codigo`),
  CONSTRAINT `fk_ubicaciones_almacenes` FOREIGN KEY (`id_almacen`) REFERENCES `almacenes` (`id_almacen`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Categorías de productos
CREATE TABLE IF NOT EXISTS `categorias` (
  `id_categoria` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Proveedores
CREATE TABLE IF NOT EXISTS `proveedores` (
  `id_proveedor` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `contacto` VARCHAR(100) DEFAULT NULL,
  `telefono` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `direccion` VARCHAR(200) DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Productos
CREATE TABLE IF NOT EXISTS `productos` (
  `id_producto` INT(11) NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(64) NOT NULL,
  `codigo_barras` VARCHAR(64) DEFAULT NULL,
  `nombre` VARCHAR(200) NOT NULL,
  `id_categoria` INT(11) DEFAULT NULL,
  `id_proveedor` INT(11) DEFAULT NULL,
  `unidad` VARCHAR(20) DEFAULT 'unidad',
  `costo` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `precio` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `impuesto` DECIMAL(5,2) DEFAULT 0.00,
  `descripcion` TEXT DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `stock_minimo` INT(11) DEFAULT 10,
  `stock_maximo` INT(11) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `uk_productos_sku` (`sku`),
  UNIQUE KEY `uk_productos_codigo_barras` (`codigo_barras`),
  KEY `idx_productos_nombre` (`nombre`),
  KEY `idx_productos_categoria` (`id_categoria`),
  KEY `idx_productos_proveedor` (`id_proveedor`),
  CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_productos_proveedores` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Stock en almacenes
CREATE TABLE IF NOT EXISTS `stock` (
  `id_stock` INT(11) NOT NULL AUTO_INCREMENT,
  `id_producto` INT(11) NOT NULL,
  `id_almacen` INT(11) NOT NULL,
  `id_ubicacion` INT(11) DEFAULT NULL,
  `cantidad` INT(11) NOT NULL DEFAULT 0,
  `fecha_actualizacion` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_stock`),
  UNIQUE KEY `uk_stock_producto_almacen_ubicacion` (`id_producto`, `id_almacen`, `id_ubicacion`),
  KEY `idx_stock_almacen` (`id_almacen`),
  KEY `idx_stock_ubicacion` (`id_ubicacion`),
  CONSTRAINT `fk_stock_productos` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_stock_almacenes` FOREIGN KEY (`id_almacen`) REFERENCES `almacenes` (`id_almacen`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_stock_ubicaciones` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id_ubicacion`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Movimientos de inventario
CREATE TABLE IF NOT EXISTS `movimientos_inventario` (
  `id_movimiento` INT(11) NOT NULL AUTO_INCREMENT,
  `id_producto` INT(11) NOT NULL,
  `id_almacen` INT(11) NOT NULL,
  `id_ubicacion` INT(11) DEFAULT NULL,
  `tipo_movimiento` ENUM('entrada','salida','ajuste','transferencia') NOT NULL,
  `cantidad` INT(11) NOT NULL,
  `cantidad_anterior` INT(11) DEFAULT 0,
  `cantidad_nueva` INT(11) DEFAULT 0,
  `motivo` VARCHAR(255) DEFAULT NULL,
  `id_usuario` INT(11) DEFAULT NULL,
  `fecha` DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_movimiento`),
  KEY `idx_movimientos_producto` (`id_producto`),
  KEY `idx_movimientos_almacen` (`id_almacen`),
  KEY `idx_movimientos_fecha` (`fecha`),
  KEY `idx_movimientos_usuario` (`id_usuario`),
  CONSTRAINT `fk_movimientos_productos` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_movimientos_almacenes` FOREIGN KEY (`id_almacen`) REFERENCES `almacenes` (`id_almacen`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_movimientos_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Órdenes de compra
CREATE TABLE IF NOT EXISTS `ordenes_compra` (
  `id_oc` INT(11) NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(50) DEFAULT NULL,
  `id_proveedor` INT(11) NOT NULL,
  `fecha` DATETIME NOT NULL DEFAULT current_timestamp(),
  `estado` ENUM('borrador','pendiente','recibida','cancelada') NOT NULL DEFAULT 'borrador',
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `impuestos` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `id_usuario` INT(11) DEFAULT NULL,
  `notas` TEXT DEFAULT NULL,
  PRIMARY KEY (`id_oc`),
  KEY `idx_oc_proveedor` (`id_proveedor`),
  KEY `idx_oc_estado` (`estado`),
  KEY `idx_oc_fecha` (`fecha`),
  CONSTRAINT `fk_oc_proveedores` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Detalle de órdenes de compra
CREATE TABLE IF NOT EXISTS `detalle_ordenes_compra` (
  `id_detalle_oc` INT(11) NOT NULL AUTO_INCREMENT,
  `id_oc` INT(11) NOT NULL,
  `id_producto` INT(11) NOT NULL,
  `cantidad` INT(11) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  `subtotal` DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  PRIMARY KEY (`id_detalle_oc`),
  KEY `idx_detalle_oc_orden` (`id_oc`),
  KEY `idx_detalle_oc_producto` (`id_producto`),
  CONSTRAINT `fk_detalle_oc_ordenes` FOREIGN KEY (`id_oc`) REFERENCES `ordenes_compra` (`id_oc`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_oc_productos` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ventas
CREATE TABLE IF NOT EXISTS `ventas` (
  `id_venta` INT(11) NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(50) DEFAULT NULL,
  `id_cliente` INT(11) DEFAULT NULL,
  `fecha` DATETIME NOT NULL DEFAULT current_timestamp(),
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `impuestos` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `id_usuario` INT(11) DEFAULT NULL,
  `estado` ENUM('pendiente','completada','cancelada') NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id_venta`),
  KEY `idx_ventas_cliente` (`id_cliente`),
  KEY `idx_ventas_fecha` (`fecha`),
  KEY `idx_ventas_usuario` (`id_usuario`),
  CONSTRAINT `fk_ventas_clientes` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ventas_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Detalle de ventas
CREATE TABLE IF NOT EXISTS `detalle_ventas` (
  `id_detalle_venta` INT(11) NOT NULL AUTO_INCREMENT,
  `id_venta` INT(11) NOT NULL,
  `id_producto` INT(11) NOT NULL,
  `cantidad` INT(11) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  `descuento` DECIMAL(10,2) DEFAULT 0.00,
  `subtotal` DECIMAL(12,2) GENERATED ALWAYS AS ((cantidad * precio_unitario) - descuento) STORED,
  PRIMARY KEY (`id_detalle_venta`),
  KEY `idx_detalle_ventas_venta` (`id_venta`),
  KEY `idx_detalle_ventas_producto` (`id_producto`),
  CONSTRAINT `fk_detalle_ventas_ventas` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_ventas_productos` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- DATOS INICIALES
-- --------------------------------------------------------

-- Insertar roles
INSERT INTO `roles` (`nombre_rol`) VALUES
('admin'),
('editor'),
('visualizador'),
('usuario')
ON DUPLICATE KEY UPDATE nombre_rol = VALUES(nombre_rol);

-- Insertar usuario administrador por defecto
-- Contraseña: admin123 (hasheada con bcrypt, 10 rounds)
INSERT INTO `usuarios` (`nombre`, `email`, `contrasena`, `id_rol`, `activo`)
VALUES (
  'Administrador',
  'admin@supermercado.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzKWMjXLhS3KZ3QtJGKqVzR6F8aCW',
  (SELECT id_rol FROM roles WHERE nombre_rol = 'admin' LIMIT 1),
  1
)
ON DUPLICATE KEY UPDATE activo = 1;

-- Insertar categorías de ejemplo
INSERT INTO `categorias` (`nombre`, `descripcion`) VALUES
('Lácteos', 'Productos lácteos y derivados'),
('Carnes', 'Carnes rojas, aves y embutidos'),
('Frutas y Verduras', 'Productos frescos'),
('Panadería', 'Pan, pasteles y productos de panadería'),
('Bebidas', 'Bebidas alcohólicas y no alcohólicas'),
('Limpieza', 'Productos de limpieza del hogar'),
('Aseo Personal', 'Productos de higiene personal')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar almacenes de ejemplo
INSERT INTO `almacenes` (`codigo`, `nombre`, `direccion`) VALUES
('ALM-001', 'Almacén Central', 'Av. Principal 123'),
('ALM-002', 'Almacén Norte', 'Zona Norte, Calle 45'),
('ALM-003', 'Almacén Sur', 'Zona Sur, Av. Libertador')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar proveedores de ejemplo
INSERT INTO `proveedores` (`nombre`, `contacto`, `telefono`, `email`) VALUES
('Distribuidora La Vaca Lola', 'Juan Pérez', '555-1234', 'juan@lavacalola.com'),
('Carnes Premium S.A.', 'María González', '555-5678', 'maria@carnespremium.com'),
('Frutas del Valle', 'Carlos Rodríguez', '555-9012', 'carlos@frutasdelvalle.com'),
('Panadería El Trigal', 'Ana Martínez', '555-3456', 'ana@eltrigal.com')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

COMMIT;
