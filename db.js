var mysql = require('mysql');
var util = require('util')
var connection = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'bookszen'
})
connection.query = util.promisify(connection.query);
connection.getConnection((err, connect) => {
  if (err) {
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.error('Database connection was closed.')
      }
      if (err.code === 'ER_CON_COUNT_ERROR') {
          console.error('Database has too many connections.')
      }
      if (err.code === 'ECONNREFUSED') {
          console.error('Database connection was refused.')
      }
  }
  if (connect) connect.release()
  return
})

module.exports = connection

