const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ejemplo de endpoint
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente 🚀');
});

app.get('/api/diaulofood', (req, res) => {
  res.json([{ id: 1, nombre: 'Benjamín' }]);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor backend corriendo en puerto ${PORT}`));
