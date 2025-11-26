-- Seed de productos, categorías, proveedores, almacenes y stocks
-- Base de datos objetivo: supermercado
-- Puedes ejecutar este script en phpMyAdmin o con el cliente mysql
-- Asegúrate de haber creado el esquema con backend/database/supermercado.sql

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

-- USE supermercado; -- Descomenta si tu sesión no está en la BD correcta

-- Categorías (idempotente)
INSERT INTO categorias (nombre, descripcion, activo) VALUES
 ('Abarrotes','Productos no perecibles de despensa',1),
 ('Bebidas','Bebidas con y sin gas',1),
 ('Lácteos','Leches, yogures, quesos',1),
 ('Carnes','Carnes y aves',1),
 ('Panadería','Pan, masas y pastelería',1),
 ('Limpieza','Limpieza del hogar',1),
 ('Higiene','Cuidado personal',1),
 ('Snacks','Snacks y golosinas',1),
 ('Frutas y Verduras','Productos frescos',1),
 ('Congelados','Productos congelados',1)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion), activo = VALUES(activo);

-- Proveedores (idempotente)
INSERT INTO proveedores (nombre, rut_o_nit, contacto, telefono, email, direccion, activo) VALUES
 ('Mayorista Central', '76.111.222-3', 'Carlos Pérez', '+56 2 2345678', 'contacto@mayoristacentral.cl', 'Av. Central 1234, Santiago', 1),
 ('Distribuidora Bebidas SPA', '77.333.444-5', 'Ana Gómez', '+56 2 2233445', 'ventas@bebidasspa.cl', 'Camino a Nos 456, San Bernardo', 1),
 ('Lácteos del Sur', '78.555.666-7', 'Juan Rojas', '+56 2 2211223', 'contacto@lacteossur.cl', 'Ruta 5 Sur Km 105, Chillán', 1),
 ('Quimex Hogar', '79.777.888-9', 'María Torres', '+56 2 2299887', 'soporte@quimex.cl', 'Parque Industrial 890, Quilicura', 1),
 ('Panadería San Juan', NULL, 'Pedro Molina', '+56 9 98765432', 'ventas@panaderiasanjuan.cl', 'Av. Los Olmos 567, Maipú', 1),
 ('Carnes Premium Ltda', '80.111.222-3', 'Luisa Vega', '+56 2 2277889', 'contacto@carnespremium.cl', 'Av. Mataderos 1200, Santiago', 1),
 ('SnackCo Chile', NULL, 'Roberto Díaz', '+56 9 91234567', 'ventas@snackco.cl', 'El Aguilucho 345, Ñuñoa', 1),
 ('Frutiverde S.A.', '81.333.444-5', 'Camila Araya', '+56 2 2266777', 'contacto@frutiverde.cl', 'Camino a Melipilla 3210, Padre Hurtado', 1)
ON DUPLICATE KEY UPDATE contacto = VALUES(contacto), telefono=VALUES(telefono), email=VALUES(email), direccion=VALUES(direccion), activo=VALUES(activo);

-- Almacenes (idempotente)
INSERT INTO almacenes (nombre, direccion) VALUES
 ('Bodega Central','Av. Principal 1000, Santiago'),
 ('Tienda Principal','Av. Las Flores 250, Santiago')
ON DUPLICATE KEY UPDATE direccion = VALUES(direccion);

-- Ubicaciones para Bodega Central (idempotente por unique compuesto)
INSERT INTO ubicaciones (id_almacen, pasillo, estante, bin)
SELECT a.id_almacen, v.pasillo, v.estante, v.bin
FROM (
  SELECT 'A' pasillo, '1' estante, '1' bin UNION ALL
  SELECT 'A','1','2' UNION ALL
  SELECT 'A','2','1' UNION ALL
  SELECT 'B','1','1'
) v
JOIN almacenes a ON a.nombre = 'Bodega Central'
ON DUPLICATE KEY UPDATE pasillo = VALUES(pasillo);

-- Productos (idempotente por SKU/código de barras únicos)
-- Campos: sku, codigo_barras, nombre, categoria, proveedor, unidad, costo, precio, impuesto, descripcion, activo, stock_minimo, stock_maximo
INSERT INTO productos (sku, codigo_barras, nombre, id_categoria, id_proveedor, unidad, costo, precio, impuesto, descripcion, activo, stock_minimo, stock_maximo)
SELECT p.sku, p.codigo_barras, p.nombre,
       (SELECT id_categoria FROM categorias WHERE nombre = p.categoria LIMIT 1) AS id_cat,
       (SELECT id_proveedor FROM proveedores WHERE nombre = p.proveedor LIMIT 1) AS id_prov,
       p.unidad, p.costo, p.precio, p.impuesto, p.descripcion, 1, p.stock_minimo, p.stock_maximo
FROM (
  -- Abarrotes
  SELECT 'ARZ-001' sku, '7801000000012' codigo_barras, 'Arroz Grano Largo 1kg' nombre, 'Abarrotes' categoria, 'Mayorista Central' proveedor, 'kg' unidad, 900.00 costo, 1490.00 precio, 19.00 impuesto, 'Arroz 1kg', 30 stock_minimo, 300 stock_maximo UNION ALL
  SELECT 'FDO-500' , '7801000000029', 'Fideos Spaghetti 500g',          'Abarrotes', 'Mayorista Central', 'g', 550.00, 990.00, 19.00, 'Spaghetti 500g', 25, 250 UNION ALL
  SELECT 'AZU-001' , '7801000000036', 'Azúcar 1kg',                      'Abarrotes', 'Mayorista Central', 'kg', 800.00, 1290.00, 19.00, 'Azúcar blanca 1kg', 25, 250 UNION ALL
  SELECT 'ACE-1L'  , '7801000000043', 'Aceite Vegetal 1L',               'Abarrotes', 'Mayorista Central', 'l', 1400.00, 2190.00, 19.00, 'Aceite 1 litro', 20, 200 UNION ALL
  -- Bebidas
  SELECT 'COC-15'  , '7802000000015', 'Coca-Cola 1.5L',                  'Bebidas',   'Distribuidora Bebidas SPA', 'l', 950.00, 1590.00, 19.00, 'Bebida cola 1.5L', 40, 400 UNION ALL
  SELECT 'AGM-15'  , '7802000000022', 'Agua Mineral 1.5L',               'Bebidas',   'Distribuidora Bebidas SPA', 'l', 400.00, 890.00, 19.00, 'Agua sin gas 1.5L', 30, 300 UNION ALL
  SELECT 'JUN-1L'  , '7802000000039', 'Jugo Naranja 1L',                 'Bebidas',   'Distribuidora Bebidas SPA', 'l', 750.00, 1290.00, 19.00, 'Jugo pasteurizado 1L', 25, 250 UNION ALL
  -- Lácteos
  SELECT 'LEC-1L'  , '7803000000018', 'Leche Entera 1L',                 'Lácteos',   'Lácteos del Sur', 'l', 650.00, 1090.00, 19.00, 'Leche UHT 1L', 35, 350 UNION ALL
  SELECT 'YOG-1L'  , '7803000000025', 'Yogurt Natural 1L',               'Lácteos',   'Lácteos del Sur', 'l', 900.00, 1490.00, 19.00, 'Yogurt natural 1L', 20, 200 UNION ALL
  SELECT 'QGD-500' , '7803000000032', 'Queso Gouda 500g',                'Lácteos',   'Lácteos del Sur', 'g', 2400.00, 3890.00, 19.00, 'Queso semi-maduro', 10, 120 UNION ALL
  SELECT 'MNT-250' , '7803000000049', 'Mantequilla 250g',                'Lácteos',   'Lácteos del Sur', 'g', 1200.00, 1990.00, 19.00, 'Mantequilla sin sal', 12, 120 UNION ALL
  -- Panadería
  SELECT 'PMB-600' , '7804000000011', 'Pan Molde Blanco 600g',           'Panadería', 'Panadería San Juan', 'g', 900.00, 1590.00, 19.00, 'Pan molde', 15, 150 UNION ALL
  -- Carnes
  SELECT 'PCH-1K'  , '7805000000014', 'Pechuga de Pollo 1kg',            'Carnes',    'Carnes Premium Ltda', 'kg', 3500.00, 5290.00, 19.00, 'Pechuga fileteada 1kg', 12, 120 UNION ALL
  -- Limpieza
  SELECT 'DET-3L'  , '7806000000017', 'Detergente Líquido 3L',           'Limpieza',  'Quimex Hogar', 'l', 2400.00, 3990.00, 19.00, 'Detergente 3 litros', 18, 180 UNION ALL
  SELECT 'LVZ-750' , '7806000000024', 'Lavaloza 750ml',                  'Limpieza',  'Quimex Hogar', 'ml', 700.00, 1290.00, 19.00, 'Lavaloza concentrado', 20, 200 UNION ALL
  SELECT 'CLO-1L'  , '7806000000031', 'Cloro 1L',                        'Limpieza',  'Quimex Hogar', 'l', 500.00, 990.00, 19.00, 'Cloro desinfectante', 20, 200 UNION ALL
  -- Higiene
  SELECT 'PHG-12'  , '7807000000010', 'Papel Higiénico 12un',            'Higiene',   'Mayorista Central', 'pack', 2800.00, 4590.00, 19.00, 'Pack 12 rollos', 16, 160 UNION ALL
  SELECT 'SHP-400' , '7807000000027', 'Shampoo 400ml',                   'Higiene',   'Mayorista Central', 'ml', 1200.00, 1990.00, 19.00, 'Shampoo cuidado diario', 14, 140 UNION ALL
  -- Snacks
  SELECT 'PAP-150' , '7808000000013', 'Papas Fritas 150g',               'Snacks',    'SnackCo Chile', 'g', 650.00, 1190.00, 19.00, 'Papas fritas clásicas', 22, 220 UNION ALL
  SELECT 'GAL-100' , '7808000000020', 'Galletas 100g',                   'Snacks',    'SnackCo Chile', 'g', 300.00, 690.00, 19.00, 'Galletas surtidas', 22, 220 UNION ALL
  SELECT 'CHO-100' , '7808000000037', 'Chocolate 100g',                  'Snacks',    'SnackCo Chile', 'g', 700.00, 1290.00, 19.00, 'Chocolate leche 100g', 18, 180 UNION ALL
  -- Frutas y Verduras (referenciales)
  SELECT 'MAN-1K'  , '7809000000016', 'Manzana Roja 1kg',                 'Frutas y Verduras', 'Frutiverde S.A.', 'kg', 900.00, 1490.00, 19.00, 'Manzana kg', 20, 200 UNION ALL
  SELECT 'PLA-1K'  , '7809000000023', 'Plátano 1kg',                      'Frutas y Verduras', 'Frutiverde S.A.', 'kg', 800.00, 1390.00, 19.00, 'Plátano kg', 20, 200 UNION ALL
  SELECT 'TOM-1K'  , '7809000000030', 'Tomate 1kg',                       'Frutas y Verduras', 'Frutiverde S.A.', 'kg', 700.00, 1290.00, 19.00, 'Tomate kg', 20, 200
) AS p (sku, codigo_barras, nombre, categoria, proveedor, unidad, costo, precio, impuesto, descripcion, stock_minimo, stock_maximo)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), id_categoria = VALUES(id_categoria), id_proveedor = VALUES(id_proveedor), unidad = VALUES(unidad), costo = VALUES(costo), precio = VALUES(precio), impuesto = VALUES(impuesto), descripcion = VALUES(descripcion), activo = VALUES(activo), stock_minimo = VALUES(stock_minimo), stock_maximo = VALUES(stock_maximo);

-- Stock inicial en Bodega Central (evita duplicar si ya existe registro)
-- Para simplificar, se asigna toda la cantidad al primer bin disponible
INSERT INTO stocks (id_producto, id_almacen, id_ubicacion, cantidad)
SELECT pr.id_producto, a.id_almacen, u.id_ubicacion, s.cantidad
FROM (
  SELECT 'ARZ-001' sku, 120 cantidad UNION ALL
  SELECT 'FDO-500', 150 UNION ALL
  SELECT 'AZU-001', 100 UNION ALL
  SELECT 'ACE-1L',   80 UNION ALL
  SELECT 'COC-15',  180 UNION ALL
  SELECT 'AGM-15',  140 UNION ALL
  SELECT 'JUN-1L',  110 UNION ALL
  SELECT 'LEC-1L',  160 UNION ALL
  SELECT 'YOG-1L',   90 UNION ALL
  SELECT 'QGD-500',  60 UNION ALL
  SELECT 'MNT-250',  70 UNION ALL
  SELECT 'PMB-600',  90 UNION ALL
  SELECT 'PCH-1K',   50 UNION ALL
  SELECT 'DET-3L',   80 UNION ALL
  SELECT 'LVZ-750', 120 UNION ALL
  SELECT 'CLO-1L',  130 UNION ALL
  SELECT 'PHG-12',  100 UNION ALL
  SELECT 'SHP-400',  85 UNION ALL
  SELECT 'PAP-150', 140 UNION ALL
  SELECT 'GAL-100', 160 UNION ALL
  SELECT 'CHO-100',  95 UNION ALL
  SELECT 'MAN-1K',  100 UNION ALL
  SELECT 'PLA-1K',  100 UNION ALL
  SELECT 'TOM-1K',   90
) s
JOIN productos pr ON pr.sku = s.sku
JOIN almacenes a ON a.nombre = 'Bodega Central'
JOIN (
  SELECT u2.id_ubicacion, u2.id_almacen
  FROM ubicaciones u2
  JOIN almacenes a2 ON a2.id_almacen = u2.id_almacen AND a2.nombre = 'Bodega Central'
  ORDER BY u2.pasillo, u2.estante, u2.bin
  LIMIT 1
) u ON u.id_almacen = a.id_almacen
WHERE NOT EXISTS (
  SELECT 1 FROM stocks st
  WHERE st.id_producto = pr.id_producto AND st.id_almacen = a.id_almacen AND (st.id_ubicacion <=> u.id_ubicacion)
);

COMMIT;
