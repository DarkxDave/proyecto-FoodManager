-- Seed de próximos despachos y pedidos por realizar
-- BD objetivo: supermercado
-- Usa ordenes_compra:
--  - estado = 'pendiente'  -> Próximos despachos (orden confirmada, en tránsito)
--  - estado = 'borrador'   -> Pedidos por realizar (solicitudes/ideas aún no confirmadas)

START TRANSACTION;

-- Proveedores base (si no existen)
INSERT INTO proveedores (nombre, email, activo)
VALUES 
  ('Mayorista Central', 'contacto@mayorista-central.example', 1),
  ('Distribuciones Sur', 'ventas@distsur.example', 1),
  ('Alimentos del Norte', 'comercial@alimentosnorte.example', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Tomar IDs de proveedores
SET @prov1 := (SELECT id_proveedor FROM proveedores WHERE nombre = 'Mayorista Central' LIMIT 1);
SET @prov2 := (SELECT id_proveedor FROM proveedores WHERE nombre = 'Distribuciones Sur' LIMIT 1);
SET @prov3 := (SELECT id_proveedor FROM proveedores WHERE nombre = 'Alimentos del Norte' LIMIT 1);

-- Próximos despachos (pendiente) - fechas futuras
INSERT INTO ordenes_compra (codigo, id_proveedor, fecha, estado, subtotal, impuestos, total)
VALUES
  ('AJS3803NSKNFK23', @prov1, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'pendiente', 250000.00, 47500.00, 297500.00),
  ('LKSJDFLKS32933',  @prov2, DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'pendiente', 180000.00, 34200.00, 214200.00),
  ('GK34553JKS0349K', @prov3, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'pendiente', 320000.00, 60800.00, 380800.00)
ON DUPLICATE KEY UPDATE estado = VALUES(estado), subtotal = VALUES(subtotal), impuestos = VALUES(impuestos), total = VALUES(total);

-- Pedidos por realizar (borrador) - fechas tentativas (hoy)
INSERT INTO ordenes_compra (codigo, id_proveedor, fecha, estado, subtotal, impuestos, total)
VALUES
  ('PR-001', @prov1, CURDATE(), 'borrador', 90000.00, 17100.00, 107100.00),
  ('PR-002', @prov2, CURDATE(), 'borrador', 120000.00, 22800.00, 142800.00),
  ('PR-003', @prov3, CURDATE(), 'borrador', 60000.00, 11400.00, 71400.00)
ON DUPLICATE KEY UPDATE estado = VALUES(estado), subtotal = VALUES(subtotal), impuestos = VALUES(impuestos), total = VALUES(total);

-- Detalle mínimo asociado (si existen algunos productos cargados)
-- Se asume que hay al menos 1 producto (id_producto mínimo)
SET @prod := (SELECT MIN(id_producto) FROM productos);

INSERT INTO ordenes_compra_detalle (id_oc, id_producto, cantidad, precio_unitario, impuesto_porcentaje, descuento_porcentaje)
SELECT oc.id_oc, @prod, 100, 1500.00, 19.00, 0.00
FROM ordenes_compra oc
WHERE oc.codigo IN ('AJS3803NSKNFK23','LKSJDFLKS32933','GK34553JKS0349K','PR-001','PR-002','PR-003')
ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad), precio_unitario = VALUES(precio_unitario), impuesto_porcentaje = VALUES(impuesto_porcentaje), descuento_porcentaje = VALUES(descuento_porcentaje);

COMMIT;
