const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

/**
 * Helper: verificar si el usuario tiene rol admin
 */
function isAdmin(user) {
  return (user.rol || '').toLowerCase() === 'admin';
}

/**
 * GET /api/usuarios
 * Listar usuarios con paginación y filtros
 * Solo admin
 */
router.get('/', auth, async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ mensaje: 'Solo administradores pueden listar usuarios' });
  }

  try {
    const { q = '', rol = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (q) {
      whereClause += ' AND (u.nombre LIKE ? OR u.email LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    if (rol) {
      whereClause += ' AND r.nombre_rol = ?';
      params.push(rol);
    }

    // Contar total
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM usuarios u 
       LEFT JOIN roles r ON u.id_rol = r.id_rol 
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Obtener usuarios
    const [usuarios] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.telefono, u.activo, 
              u.created_at, r.nombre_rol as rol
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id_rol
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      usuarios,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

/**
 * GET /api/usuarios/roles/list
 * Listar todos los roles disponibles
 * Solo admin
 */
router.get('/roles/list', auth, async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ mensaje: 'Solo administradores pueden listar roles' });
  }

  try {
    const [roles] = await db.query('SELECT id_rol, nombre_rol FROM roles ORDER BY nombre_rol');
    res.json(roles);
  } catch (error) {
    console.error('Error al listar roles:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

/**
 * GET /api/usuarios/:id
 * Obtener detalle de un usuario
 * Solo admin
 */
router.get('/:id', auth, async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ mensaje: 'Solo administradores pueden ver detalles de usuarios' });
  }

  try {
    const [usuarios] = await db.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.telefono, u.activo, 
              u.created_at, r.nombre_rol as rol, u.id_rol
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = ?`,
      [req.params.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

/**
 * POST /api/usuarios
 * Crear nuevo usuario
 * Solo admin
 */
router.post('/', auth, async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ mensaje: 'Solo administradores pueden crear usuarios' });
  }

  try {
    const { nombre, email, telefono, contrasena, id_rol } = req.body;

    if (!nombre || !email || !contrasena || !id_rol) {
      return res.status(400).json({ mensaje: 'Faltan datos (nombre, email, contrasena, id_rol)' });
    }

    // Verificar que el email no exista
    const [existe] = await db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
    if (existe.length > 0) {
      return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }

    // Verificar que el rol existe
    const [rolExiste] = await db.query('SELECT id_rol FROM roles WHERE id_rol = ?', [id_rol]);
    if (rolExiste.length === 0) {
      return res.status(400).json({ mensaje: 'Rol inválido' });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    await db.query(
      'INSERT INTO usuarios (nombre, email, telefono, contrasena, id_rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, telefono || null, hashedPassword, id_rol]
    );

    res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

/**
 * PUT /api/usuarios/:id
 * Actualizar usuario (nombre, email, telefono, activo)
 * Solo admin
 */
router.put('/:id', auth, async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ mensaje: 'Solo administradores pueden actualizar usuarios' });
  }

  try {
    const { nombre, email, telefono, activo } = req.body;

    // Verificar que el usuario existe
    const [usuarioExiste] = await db.query('SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    if (usuarioExiste.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Si se cambia el email, verificar que no esté en uso
    if (email) {
      const [emailExiste] = await db.query(
        'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
        [email, req.params.id]
      );
      if (emailExiste.length > 0) {
        return res.status(409).json({ mensaje: 'El email ya está en uso por otro usuario' });
      }
    }

    const updates = [];
    const params = [];

    if (nombre !== undefined) {
      updates.push('nombre = ?');
      params.push(nombre);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (telefono !== undefined) {
      updates.push('telefono = ?');
      params.push(telefono);
    }
    if (activo !== undefined) {
      updates.push('activo = ?');
      params.push(activo ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ mensaje: 'No hay datos para actualizar' });
    }

    params.push(req.params.id);
    await db.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id_usuario = ?`,
      params
    );

    res.json({ mensaje: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

/**
 * PUT /api/usuarios/:id/rol
 * Cambiar rol de un usuario
 * Solo admin
 */
router.put('/:id/rol', auth, async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ mensaje: 'Solo administradores pueden cambiar roles' });
  }

  try {
    const { id_rol } = req.body;

    if (!id_rol) {
      return res.status(400).json({ mensaje: 'Falta el id_rol' });
    }

    // Verificar que el usuario existe
    const [usuarioExiste] = await db.query('SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    if (usuarioExiste.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar que el rol existe
    const [rolExiste] = await db.query('SELECT id_rol FROM roles WHERE id_rol = ?', [id_rol]);
    if (rolExiste.length === 0) {
      return res.status(400).json({ mensaje: 'Rol inválido' });
    }

    // Evitar que un admin se quite su propio rol de admin (medida de seguridad)
    if (parseInt(req.params.id) === req.user.sub) {
      const [rolActual] = await db.query('SELECT id_rol FROM usuarios WHERE id_usuario = ?', [req.user.sub]);
      const [adminRol] = await db.query('SELECT id_rol FROM roles WHERE nombre_rol = ?', ['admin']);
      
      if (rolActual[0].id_rol === adminRol[0].id_rol && id_rol !== adminRol[0].id_rol) {
        return res.status(400).json({ mensaje: 'No puedes quitarte tu propio rol de administrador' });
      }
    }

    await db.query('UPDATE usuarios SET id_rol = ? WHERE id_usuario = ?', [id_rol, req.params.id]);

    res.json({ mensaje: 'Rol actualizado exitosamente' });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

/**
 * DELETE /api/usuarios/:id
 * Eliminar usuario (lógico: activo = 0)
 * Solo admin
 */
router.delete('/:id', auth, async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ mensaje: 'Solo administradores pueden eliminar usuarios' });
  }

  try {
    // Verificar que el usuario existe
    const [usuarioExiste] = await db.query('SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    if (usuarioExiste.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Evitar que un admin se elimine a sí mismo
    if (parseInt(req.params.id) === req.user.sub) {
      return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta' });
    }

    await db.query('UPDATE usuarios SET activo = 0 WHERE id_usuario = ?', [req.params.id]);

    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
