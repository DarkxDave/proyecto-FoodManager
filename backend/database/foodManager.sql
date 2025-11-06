
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Base de datos: `supermercado`
-- NOTA: Cree/seleccione la BD en su servidor antes de ejecutar este script si es necesario.
-- Ejemplo: CREATE DATABASE IF NOT EXISTS supermercado CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci; USE supermercado;
--

-- --------------------------------------------------------
-- Roles (admin, usuario)
-- --------------------------------------------------------
CREATE TABLE `roles` (
  `id_rol` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uk_roles_nombre` (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Usuarios del sistema
-- --------------------------------------------------------
CREATE TABLE `usuarios` (
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

-- --------------------------------------------------------
-- Clientes (opcional para ventas con identificación de cliente)
-- --------------------------------------------------------
CREATE TABLE `clientes` (
  `id_cliente` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `telefono` VARCHAR(30) DEFAULT NULL,
  `documento` VARCHAR(50) DEFAULT NULL,
  `direccion` VARCHAR(200) DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uk_clientes_email` (`email`),
  UNIQUE KEY `uk_clientes_documento` (`documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Categorías de productos
-- --------------------------------------------------------
CREATE TABLE `categorias` (
  `id_categoria` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `uk_categorias_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Proveedores
-- --------------------------------------------------------
CREATE TABLE `proveedores` (
  `id_proveedor` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `rut_o_nit` VARCHAR(50) DEFAULT NULL,
  `contacto` VARCHAR(100) DEFAULT NULL,
  `telefono` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `direccion` VARCHAR(200) DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `uk_proveedores_rut` (`rut_o_nit`),
  UNIQUE KEY `uk_proveedores_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Almacenes (bodegas/tiendas)
-- --------------------------------------------------------
CREATE TABLE `almacenes` (
  `id_almacen` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `direccion` VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (`id_almacen`),
  UNIQUE KEY `uk_almacenes_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Ubicaciones físicas dentro de un almacén (pasillo/estante/bin)
-- --------------------------------------------------------
CREATE TABLE `ubicaciones` (
  `id_ubicacion` INT(11) NOT NULL AUTO_INCREMENT,
  `id_almacen` INT(11) NOT NULL,
  `pasillo` VARCHAR(50) DEFAULT NULL,
  `estante` VARCHAR(50) DEFAULT NULL,
  `bin` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id_ubicacion`),
  KEY `idx_ubicaciones_almacen` (`id_almacen`),
  UNIQUE KEY `uk_ubicacion_completa` (`id_almacen`,`pasillo`,`estante`,`bin`),
  CONSTRAINT `fk_ubicaciones_almacenes` FOREIGN KEY (`id_almacen`) REFERENCES `almacenes` (`id_almacen`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Productos (SKU, código de barras, categoría, proveedor)
-- --------------------------------------------------------
CREATE TABLE `productos` (
  `id_producto` INT(11) NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(64) NOT NULL,
  `codigo_barras` VARCHAR(64) DEFAULT NULL,
  `nombre` VARCHAR(200) NOT NULL,
  `id_categoria` INT(11) DEFAULT NULL,
  `id_proveedor` INT(11) DEFAULT NULL,
  `unidad` ENUM('unidad','kg','g','l','ml','pack') NOT NULL DEFAULT 'unidad',
  `costo` DECIMAL(10,2) NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `impuesto` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Porcentaje %',
  `descripcion` TEXT DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `stock_minimo` INT(11) DEFAULT 0,
  `stock_maximo` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `uk_productos_sku` (`sku`),
  UNIQUE KEY `uk_productos_codigo_barras` (`codigo_barras`),
  KEY `idx_productos_categoria` (`id_categoria`),
  KEY `idx_productos_proveedor` (`id_proveedor`),
  CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_productos_proveedores` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Stock por almacén/ubicación (cantidad actual)
-- --------------------------------------------------------
CREATE TABLE `stocks` (
  `id_stock` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `id_producto` INT(11) NOT NULL,
  `id_almacen` INT(11) NOT NULL,
  `id_ubicacion` INT(11) DEFAULT NULL,
  `cantidad` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_stock`),
  KEY `idx_stocks_producto` (`id_producto`),
  KEY `idx_stocks_almacen` (`id_almacen`),
  KEY `idx_stocks_ubicacion` (`id_ubicacion`),
  CONSTRAINT `fk_stocks_productos` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_stocks_almacenes` FOREIGN KEY (`id_almacen`) REFERENCES `almacenes` (`id_almacen`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_stocks_ubicaciones` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id_ubicacion`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Movimientos de inventario 
-- --------------------------------------------------------
CREATE TABLE `movimientos_inventario` (
  `id_movimiento` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `id_producto` INT(11) NOT NULL,
  `id_almacen` INT(11) NOT NULL,
  `id_ubicacion` INT(11) DEFAULT NULL,
  `tipo` ENUM('entrada','salida','ajuste') NOT NULL,
  `cantidad` INT(11) NOT NULL,
  `costo_unitario` DECIMAL(10,2) DEFAULT NULL,
  `motivo` VARCHAR(200) DEFAULT NULL,
  `referencia` VARCHAR(100) DEFAULT NULL,
  `id_usuario` INT(11) DEFAULT NULL,
  `fecha` DATETIME NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_movimiento`),
  KEY `idx_mov_prod_fecha` (`id_producto`,`fecha`),
  KEY `idx_mov_almacen` (`id_almacen`),
  CONSTRAINT `fk_mov_productos` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_almacenes` FOREIGN KEY (`id_almacen`) REFERENCES `almacenes` (`id_almacen`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_ubicaciones` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id_ubicacion`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Órdenes de compra (ingreso de mercadería)
-- --------------------------------------------------------
CREATE TABLE `ordenes_compra` (
  `id_oc` INT(11) NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(50) DEFAULT NULL,
  `id_proveedor` INT(11) NOT NULL,
  `fecha` DATETIME NOT NULL DEFAULT current_timestamp(),
  `estado` ENUM('borrador','pendiente','recibida','cancelada') NOT NULL DEFAULT 'pendiente',
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `impuestos` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `id_usuario` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id_oc`),
  UNIQUE KEY `uk_oc_codigo` (`codigo`),
  KEY `idx_oc_proveedor` (`id_proveedor`),
  CONSTRAINT `fk_oc_proveedores` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_oc_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `ordenes_compra_detalle` (
  `id_oc` INT(11) NOT NULL,
  `id_producto` INT(11) NOT NULL,
  `cantidad` INT(11) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  `impuesto_porcentaje` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `descuento_porcentaje` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id_oc`,`id_producto`),
  KEY `idx_ocd_producto` (`id_producto`),
  CONSTRAINT `fk_ocd_oc` FOREIGN KEY (`id_oc`) REFERENCES `ordenes_compra` (`id_oc`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ocd_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Ventas (POS)
-- --------------------------------------------------------
CREATE TABLE `ventas` (
  `id_venta` INT(11) NOT NULL AUTO_INCREMENT,
  `folio` VARCHAR(50) DEFAULT NULL,
  `fecha` DATETIME NOT NULL DEFAULT current_timestamp(),
  `id_usuario` INT(11) DEFAULT NULL,
  `id_cliente` INT(11) DEFAULT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `impuestos` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `descuentos` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `metodo_pago` ENUM('efectivo','tarjeta','transferencia','mixto') NOT NULL DEFAULT 'efectivo',
  `estado` ENUM('completada','anulada') NOT NULL DEFAULT 'completada',
  PRIMARY KEY (`id_venta`),
  UNIQUE KEY `uk_ventas_folio` (`folio`),
  KEY `idx_ventas_usuario` (`id_usuario`),
  KEY `idx_ventas_cliente` (`id_cliente`),
  CONSTRAINT `fk_ventas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ventas_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `ventas_detalle` (
  `id_venta` INT(11) NOT NULL,
  `id_producto` INT(11) NOT NULL,
  `cantidad` INT(11) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  `impuesto_porcentaje` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `descuento_porcentaje` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id_venta`,`id_producto`),
  KEY `idx_vd_producto` (`id_producto`),
  CONSTRAINT `fk_vd_ventas` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vd_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Semillas básicas
-- --------------------------------------------------------
INSERT INTO `roles` (`nombre_rol`) VALUES ('admin') ON DUPLICATE KEY UPDATE `nombre_rol` = VALUES(`nombre_rol`);
INSERT INTO `roles` (`nombre_rol`) VALUES ('usuario') ON DUPLICATE KEY UPDATE `nombre_rol` = VALUES(`nombre_rol`);

COMMIT;