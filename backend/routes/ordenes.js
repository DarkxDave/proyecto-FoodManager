const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// GET /api/ordenes/pendientes - próximos despachos
router.get('/pendientes', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT oc.id_oc, oc.codigo, oc.fecha, p.nombre AS proveedor, oc.estado, oc.total
       FROM ordenes_compra oc
       JOIN proveedores p ON p.id_proveedor = oc.id_proveedor
       WHERE oc.estado = 'pendiente' AND DATE(oc.fecha) >= CURDATE()
       ORDER BY oc.fecha ASC`
    );
    res.json(rows.map(r => ({
      id_oc: r.id_oc,
      codigo: r.codigo,
      fecha: r.fecha,
      proveedor: r.proveedor,
      estado: r.estado,
      total: Number(r.total)
    })));
  } catch (err) {
    console.error('GET /ordenes/pendientes error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// GET /api/ordenes/borrador - pedidos por realizar
router.get('/borrador', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT oc.id_oc, oc.codigo, oc.fecha, p.nombre AS proveedor, oc.estado, oc.total
       FROM ordenes_compra oc
       JOIN proveedores p ON p.id_proveedor = oc.id_proveedor
       WHERE oc.estado = 'borrador'
       ORDER BY oc.fecha DESC`
    );
    res.json(rows.map(r => ({
      id_oc: r.id_oc,
      codigo: r.codigo,
      fecha: r.fecha,
      proveedor: r.proveedor,
      estado: r.estado,
      total: Number(r.total)
    })));
  } catch (err) {
    console.error('GET /ordenes/borrador error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;

// POST /api/ordenes - crear borrador de orden de compra (solo admin)
router.post('/', auth, async (req, res) => {
  try {
    const user = req.user || {};
    const rol = String(user.rol || '').toLowerCase();
    if (rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo administradores' });
    }

    const { id_proveedor, codigo, subtotal, impuestos, total, fecha } = req.body;
    if (!id_proveedor || subtotal == null || impuestos == null || total == null) {
      return res.status(400).json({ mensaje: 'Faltan datos (id_proveedor, subtotal, impuestos, total)' });
    }
    const fechaVal = fecha ? new Date(fecha) : new Date();

    const [result] = await db.query(
      `INSERT INTO ordenes_compra (codigo, id_proveedor, fecha, estado, subtotal, impuestos, total, id_usuario)
       VALUES (?, ?, ?, 'borrador', ?, ?, ?, ?)`,
      [codigo || null, id_proveedor, fechaVal, subtotal, impuestos, total, user.id_usuario || null]
    );
    return res.status(201).json({ mensaje: 'Orden creada', id_oc: result.insertId });
  } catch (err) {
    console.error('POST /ordenes error:', err);
    return res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});
