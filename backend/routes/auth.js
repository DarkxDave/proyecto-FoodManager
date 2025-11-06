const express = require('express');
const router = express.Router();
const conexion = require('proyecto-web-diaulofood/backend/index.js');

/*registro
router.post('/register', (req, res) => {
    const { rut, nombre_usuario, email, region, comuna, contrasena, id_rol } = req.body;

    if (!rut || !nombre_usuario || !email || !region || !comuna || !contrasena || !id_rol) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    const sql = 'INSERT INTO Usuarios (rut, nombre_usuario, email, region, comuna, contrasena, id_rol) VALUES (?, ?, ?, ?, ?, ?, ?)';
    conexion.query(sql, [rut, nombre_usuario, email, region, comuna, contrasena, id_rol], (err, result) => {
        if (err) {
            console.error('Error al registrar usuario:', err);
            return res.status(500).json({ mensaje: 'Error en el servidor' });
        }
        res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
    });
});*/


router.post('/login', (req, res) => {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
        return res.status(400).json({ mensaje: 'Faltan credenciales' });
    }

    const sql = 'SELECT * FROM Usuarios WHERE email = ? AND contrasena = ?';
    conexion.query(sql, [email, contrasena], (err, results) => {
        if (err) {
            console.error('Error al iniciar sesión:', err);
            return res.status(500).json({ mensaje: 'Error en el servidor' });
        }

        if (results.length > 0) {
            res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario: results[0] });
        } else {
            res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }
    });
});

module.exports = router;
