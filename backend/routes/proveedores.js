const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/proveedores/list - lista simple para selects
router.get('/list', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id_proveedor, nombre FROM proveedores WHERE activo = 1 ORDER BY nombre ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /proveedores/list error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
