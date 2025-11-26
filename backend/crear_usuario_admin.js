// Script para crear usuario admin de prueba
// Ejecutar: node crear_usuario_admin.js

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function crearUsuarioAdmin() {
  console.log('🔧 Creando usuario administrador...');
  
  // Conexión a la base de datos
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'supermercado'
  });

  try {
    // Hashear la contraseña
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Contraseña hasheada');

    // Obtener el id_rol de admin
    const [roles] = await connection.query(
      'SELECT id_rol FROM roles WHERE nombre_rol = ? LIMIT 1',
      ['admin']
    );

    if (roles.length === 0) {
      console.error('❌ No existe el rol "admin". Ejecuta primero el script supermercado.sql');
      process.exit(1);
    }

    const idRolAdmin = roles[0].id_rol;
    console.log(`✅ Rol admin encontrado (ID: ${idRolAdmin})`);

    // Verificar si ya existe el usuario
    const [existingUsers] = await connection.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      ['admin@admin.com']
    );

    if (existingUsers.length > 0) {
      // Actualizar contraseña si ya existe
      await connection.query(
        'UPDATE usuarios SET contrasena = ?, activo = 1 WHERE email = ?',
        [hashedPassword, 'admin@admin.com']
      );
      console.log('✅ Usuario admin actualizado');
    } else {
      // Crear nuevo usuario
      await connection.query(
        'INSERT INTO usuarios (nombre, email, contrasena, id_rol, activo) VALUES (?, ?, ?, ?, 1)',
        ['Administrador', 'admin@admin.com', hashedPassword, idRolAdmin]
      );
      console.log('✅ Usuario admin creado');
    }

    // Mostrar credenciales
    console.log('\n📧 Credenciales de acceso:');
    console.log('   Email:    admin@admin.com');
    console.log('   Password: admin123');
    console.log('\n🚀 Puedes iniciar sesión con estas credenciales\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

crearUsuarioAdmin();
