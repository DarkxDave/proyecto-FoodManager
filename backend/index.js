const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const almacenesRoutes = require('./routes/almacenes');
const productosRoutes = require('./routes/productos');
const ordenesRoutes = require('./routes/ordenes');
const usuariosRouter = require('./routes/usuarios');
const proveedoresRoutes = require('./routes/proveedores');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/almacenes', almacenesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/proveedores', proveedoresRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor backend corriendo en puerto ${PORT}`));

module.exports = app;
