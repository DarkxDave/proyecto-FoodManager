const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'supermercado'
});

conexion.connect(err => {
  if (err) {
    console.error(' Error al conectar con la base de datos:', err);
    return;
  }
  console.log(' Conexión exitosa a supermercado');
});

module.exports = conexion;
