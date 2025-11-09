const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const auth = require('../middleware/auth');

// GET /api/auth/health – Verifica conexión a la base de datos
router.get('/health', async (_req, res) => {
    try {
        const [[rolesCountRow]] = await db.query('SELECT COUNT(*) AS roles FROM roles');
        const [[usersCountRow]] = await db.query('SELECT COUNT(*) AS usuarios FROM usuarios');
        return res.json({
            ok: true,
            db: 'connected',
            counts: {
                roles: rolesCountRow.roles,
                usuarios: usersCountRow.usuarios
            }
        });
    } catch (err) {
        console.error('Health error:', err);
        return res.status(500).json({ ok: false, mensaje: 'DB error', code: err.code, sqlMessage: err.sqlMessage });
    }
});

// Ejemplo de ruta protegida por JWT
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.sub;
        const [rows] = await db.query(
            'SELECT u.id_usuario, u.nombre, u.email, r.nombre_rol AS rol FROM usuarios u INNER JOIN roles r ON r.id_rol = u.id_rol WHERE u.id_usuario = ? LIMIT 1',
            [userId]
        );
        if (!rows.length) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('ME error:', err);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

// POST /api/auth/register (uso básico para crear usuarios)
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, contrasena, rol } = req.body;
        if (!nombre || !email || !contrasena) {
            return res.status(400).json({ mensaje: 'Faltan datos (nombre, email, contrasena)' });
        }

        // Rol por defecto 'usuario'
        const rolNombre = (rol || 'usuario').toLowerCase();

        const [exists] = await db.query('SELECT 1 FROM usuarios WHERE email = ? LIMIT 1', [email]);
        if (exists.length > 0) {
            return res.status(409).json({ mensaje: 'El email ya está registrado' });
        }

        const hash = await bcrypt.hash(contrasena, 10);

        const [rolRows] = await db.query('SELECT id_rol FROM roles WHERE nombre_rol = ? LIMIT 1', [rolNombre]);
        if (!rolRows.length) {
            return res.status(400).json({ mensaje: `Rol no válido: ${rolNombre}` });
        }
        const idRol = rolRows[0].id_rol;

        await db.query(
            'INSERT INTO usuarios (nombre, email, contrasena, id_rol, activo) VALUES (?, ?, ?, ?, 1)',
            [nombre, email, hash, idRol]
        );

        return res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
    } catch (err) {
        console.error('Error en register:', err);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        if (!email || !contrasena) {
            return res.status(400).json({ mensaje: 'Faltan credenciales' });
        }

        const [rows] = await db.query(
            'SELECT u.id_usuario, u.nombre, u.email, u.contrasena, r.nombre_rol FROM usuarios u INNER JOIN roles r ON r.id_rol = u.id_rol WHERE u.email = ? AND u.activo = 1 LIMIT 1',
            [email]
        );

        if (!rows || rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const user = rows[0];
        const ok = await bcrypt.compare(contrasena, user.contrasena);
        if (!ok) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const payload = { sub: user.id_usuario, email: user.email, rol: user.nombre_rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '8h' });

        return res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                email: user.email,
                rol: user.nombre_rol
            }
        });
    } catch (err) {
        console.error('Error en login:', err);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

module.exports = router;
