-- Script para crear un usuario admin de prueba
-- Ejecutar en phpMyAdmin o MySQL Workbench

-- Primero verificar que existe el rol admin
SELECT * FROM roles WHERE nombre_rol = 'admin';

-- Si no existe, crearlo (aunque debería existir del script supermercado.sql)
-- INSERT INTO roles (nombre_rol) VALUES ('admin');

-- Crear usuario admin de prueba
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO usuarios (nombre, email, contrasena, id_rol, activo)
VALUES (
  'Administrador',
  'admin@admin.com',
  '$2a$10$rX5YqW5KZYvQxJN5XQxJYeYG5vXqYvH5vXqYvH5vXqYvH5vXqYvH5u', -- admin123
  (SELECT id_rol FROM roles WHERE nombre_rol = 'admin' LIMIT 1),
  1
)
ON DUPLICATE KEY UPDATE activo = 1;

-- Verificar que se creó
SELECT u.id_usuario, u.nombre, u.email, r.nombre_rol 
FROM usuarios u
INNER JOIN roles r ON r.id_rol = u.id_rol
WHERE u.email = 'admin@admin.com';
