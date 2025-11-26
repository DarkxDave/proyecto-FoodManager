const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

function hasRole(user, roles = []) {
  const r = (user?.rol || '').toLowerCase();
  return roles.map(x => x.toLowerCase()).includes(r);
}

// GET /api/productos - listado paginado + filtros
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
    const offset = (page - 1) * limit;
    const q = (req.query.q || '').toString().trim();
    const categoria = req.query.categoria ? parseInt(req.query.categoria) : null;
    const minPrecio = req.query.minPrecio ? parseFloat(req.query.minPrecio) : null;
    const maxPrecio = req.query.maxPrecio ? parseFloat(req.query.maxPrecio) : null;

    const where = ['p.activo = 1'];
    const params = [];
    if (q) { where.push('(p.nombre LIKE ? OR p.sku LIKE ? OR p.codigo_barras LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    if (categoria) { where.push('p.id_categoria = ?'); params.push(categoria); }
    if (minPrecio !== null) { where.push('p.precio >= ?'); params.push(minPrecio); }
    if (maxPrecio !== null) { where.push('p.precio <= ?'); params.push(maxPrecio); }

    const whereSql = where.length ? ('WHERE ' + where.join(' AND ')) : '';

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM productos p ${whereSql}`, params);

    const [rows] = await db.query(
      `SELECT p.id_producto, p.sku, p.codigo_barras, p.nombre, p.precio, p.descripcion, p.id_categoria, c.nombre AS categoria,
              p.id_proveedor, pr.nombre AS proveedor, p.stock_minimo, p.stock_maximo, p.activo
       FROM productos p
       LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
       LEFT JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor
       ${whereSql}
       ORDER BY p.nombre
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('GET /productos error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// GET /api/productos/:id - detalle
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT p.* FROM productos p WHERE p.id_producto = ?`, [id]
    );
    if (!rows.length) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /productos/:id error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// POST /api/productos - crear (admin, editor)
router.post('/', auth, async (req, res) => {
  try {
    if (!hasRole(req.user, ['admin', 'editor'])) {
      return res.status(403).json({ mensaje: 'Sin permisos' });
    }
    const { sku, codigo_barras, nombre, id_categoria, id_proveedor, unidad, costo, precio, impuesto, descripcion, stock_minimo, stock_maximo } = req.body;
    if (!sku || !nombre || precio == null || costo == null) {
      return res.status(400).json({ mensaje: 'Faltan datos (sku, nombre, costo, precio)' });
    }
    try {
      await db.query(
        `INSERT INTO productos (sku, codigo_barras, nombre, id_categoria, id_proveedor, unidad, costo, precio, impuesto, descripcion, activo, stock_minimo, stock_maximo)
         VALUES (?, ?, ?, ?, ?, COALESCE(?, 'unidad'), ?, ?, COALESCE(?, 0), ?, 1, COALESCE(?, 0), ?)`,
        [sku, codigo_barras || null, nombre, id_categoria || null, id_proveedor || null, unidad, costo, precio, impuesto, descripcion || null, stock_minimo, stock_maximo]
      );
      res.status(201).json({ mensaje: 'Producto creado' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ mensaje: 'SKU o código de barras ya existe' });
      }
      console.error('POST /productos error:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
  } catch (err) {
    console.error('POST /productos error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// PUT /api/productos/:id - actualizar (admin, editor)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!hasRole(req.user, ['admin', 'editor'])) {
      return res.status(403).json({ mensaje: 'Sin permisos' });
    }
    const { id } = req.params;
    const { sku, codigo_barras, nombre, id_categoria, id_proveedor, unidad, costo, precio, impuesto, descripcion, stock_minimo, stock_maximo, activo } = req.body;
    if (!nombre) return res.status(400).json({ mensaje: 'Nombre requerido' });
    try {
      const [result] = await db.query(
        `UPDATE productos SET sku = ?, codigo_barras = ?, nombre = ?, id_categoria = ?, id_proveedor = ?, unidad = COALESCE(?, unidad), costo = ?, precio = ?, impuesto = COALESCE(?, 0), descripcion = ?, stock_minimo = COALESCE(?, stock_minimo), stock_maximo = ?, activo = COALESCE(?, activo)
         WHERE id_producto = ?`,
        [sku, codigo_barras || null, nombre, id_categoria || null, id_proveedor || null, unidad, costo, precio, impuesto, descripcion || null, stock_minimo, stock_maximo, activo, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
      res.json({ mensaje: 'Producto actualizado' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ mensaje: 'SKU o código de barras ya existe' });
      }
      console.error('PUT /productos/:id error:', err);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
  } catch (err) {
    console.error('PUT /productos/:id error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// DELETE /api/productos/:id - borrado lógico (admin, editor)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!hasRole(req.user, ['admin', 'editor'])) {
      return res.status(403).json({ mensaje: 'Sin permisos' });
    }
    const { id } = req.params;
    const [result] = await db.query('UPDATE productos SET activo = 0 WHERE id_producto = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    console.error('DELETE /productos/:id error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// GET /api/productos/alertas - productos con stock bajo
router.get('/alertas', auth, async (req, res) => {
  try {
  const [rows] = await db.query(
    `SELECT p.id_producto, p.sku, p.nombre, p.stock_minimo,
      COALESCE(SUM(s.cantidad), 0) AS stock_actual,
      c.nombre AS categoria
     FROM productos p
     LEFT JOIN stock s ON s.id_producto = p.id_producto
     LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
     WHERE p.activo = 1
     GROUP BY p.id_producto, p.sku, p.nombre, p.stock_minimo, c.nombre
     HAVING stock_actual < 20
     ORDER BY stock_actual ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /productos/alertas error:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
