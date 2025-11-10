const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

async function getMetrics(db, almacenId) {
  // Counts
  const [[{ productosTotal }]] = await db.query(
    `SELECT COUNT(DISTINCT s.id_producto) AS productosTotal
     FROM stocks s WHERE s.id_almacen = ?`, [almacenId]
  );
  const [[{ categoriasTotal }]] = await db.query(
    `SELECT COUNT(DISTINCT p.id_categoria) AS categoriasTotal
     FROM stocks s JOIN productos p ON p.id_producto = s.id_producto
     WHERE s.id_almacen = ?`, [almacenId]
  );
  const [[{ itemsTotal }]] = await db.query(
    `SELECT COALESCE(SUM(s.cantidad),0) AS itemsTotal
     FROM stocks s WHERE s.id_almacen = ?`, [almacenId]
  );

  // Capacity (based on sum(stock_maximo))
  const [[cap]] = await db.query(
    `SELECT COALESCE(SUM(s.cantidad),0) AS used, COALESCE(SUM(p.stock_maximo),0) AS maxcap
     FROM stocks s JOIN productos p ON p.id_producto = s.id_producto
     WHERE s.id_almacen = ? AND p.stock_maximo IS NOT NULL`, [almacenId]
  );
  const used = Number(cap.used || 0);
  const maxcap = Number(cap.maxcap || 0);
  const usedPct = maxcap > 0 ? used / maxcap : null;

  // Categories distribution
  const [catRows] = await db.query(
    `SELECT COALESCE(c.nombre,'Sin categoría') AS nombre, COUNT(*) AS cantidad
     FROM stocks s
     JOIN productos p ON p.id_producto = s.id_producto
     LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
     WHERE s.id_almacen = ?
     GROUP BY c.id_categoria
     ORDER BY cantidad DESC`, [almacenId]
  );
  const totalCatCount = catRows.reduce((a, r) => a + Number(r.cantidad), 0) || 1;
  const categorias = catRows.map(r => ({ nombre: r.nombre, cantidad: Number(r.cantidad), pct: Number(r.cantidad) / totalCatCount }));

  // Low stock list
  const [lowRows] = await db.query(
    `SELECT p.id_producto, p.nombre, s.cantidad, p.stock_minimo
     FROM stocks s
     JOIN productos p ON p.id_producto = s.id_producto
     WHERE s.id_almacen = ? AND p.stock_minimo IS NOT NULL AND s.cantidad < p.stock_minimo
     ORDER BY (p.stock_minimo - s.cantidad) DESC
     LIMIT 10`, [almacenId]
  );
  const bajos = lowRows.map(r => ({ id_producto: r.id_producto, nombre: r.nombre, cantidad: Number(r.cantidad), stock_minimo: Number(r.stock_minimo) }));

  return {
    counts: { productosTotal: Number(productosTotal || 0), categoriasTotal: Number(categoriasTotal || 0), itemsTotal: Number(itemsTotal || 0) },
    capacity: { used, max: maxcap, usedPct, freePct: usedPct !== null ? (1 - usedPct) : null },
    categorias,
    lowStock: bajos
  };
}

// GET /api/almacenes - listar todas las bodegas/almacenes
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id_almacen, nombre, direccion FROM almacenes ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error('GET /almacenes error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// POST /api/almacenes - crear almacén (solo admin)
router.post('/', auth, async (req, res) => {
  try {
    if ((req.user.rol || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo administradores' });
    }
    const { nombre, direccion } = req.body;
    if (!nombre || String(nombre).trim().length < 2) {
      return res.status(400).json({ mensaje: 'Nombre es requerido (mínimo 2 caracteres)' });
    }
    try {
      await db.query('INSERT INTO almacenes (nombre, direccion) VALUES (?, ?)', [String(nombre).trim(), direccion || null]);
      return res.status(201).json({ mensaje: 'Almacén creado' });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ mensaje: 'El nombre de la bodega ya existe' });
      }
      console.error('POST /almacenes error:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
  } catch (err) {
    console.error('POST /almacenes error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// PUT /api/almacenes/:id - actualizar almacén (solo admin)
router.put('/:id', auth, async (req, res) => {
  try {
    if ((req.user.rol || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo administradores' });
    }
    const { id } = req.params;
    const { nombre, direccion } = req.body;
    if (!nombre || String(nombre).trim().length < 2) {
      return res.status(400).json({ mensaje: 'Nombre es requerido (mínimo 2 caracteres)' });
    }
    try {
      const [result] = await db.query('UPDATE almacenes SET nombre = ?, direccion = ? WHERE id_almacen = ?', [String(nombre).trim(), direccion || null, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Almacén no encontrado' });
      }
      return res.json({ mensaje: 'Almacén actualizado' });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ mensaje: 'El nombre de la bodega ya existe' });
      }
      console.error('PUT /almacenes/:id error:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
  } catch (err) {
    console.error('PUT /almacenes/:id error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// DELETE /api/almacenes/:id - eliminar almacén (solo admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if ((req.user.rol || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo administradores' });
    }
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM almacenes WHERE id_almacen = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Almacén no encontrado' });
    }
    return res.json({ mensaje: 'Almacén eliminado' });
  } catch (err) {
    console.error('DELETE /almacenes/:id error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
 
// GET /api/almacenes/:id/metrics - KPIs y listas para dashboard de bodega
router.get('/:id/metrics', auth, async (req, res) => {
  try {
    const metrics = await getMetrics(db, req.params.id);
    res.json(metrics);
  } catch (err) {
    console.error('GET /almacenes/:id/metrics error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// GET /api/almacenes/:id/sse - stream de métricas en tiempo real (polling interno)
router.get('/:id/sse', auth, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  const id = req.params.id;
  let closed = false;
  req.on('close', () => { closed = true; clearInterval(timer); });

  async function push() {
    try {
      const metrics = await getMetrics(db, id);
      res.write(`data: ${JSON.stringify(metrics)}\n\n`);
    } catch (e) {
      // on error, write minimal info
      res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
    }
  }
  await push();
  const timer = setInterval(() => { if (!closed) push(); }, 5000);
});
