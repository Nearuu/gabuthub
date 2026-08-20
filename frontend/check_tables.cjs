const mysql = require('mysql2/promise');

async function check() {
  const myConn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'entertainment_hub'
  });

  const [tables] = await myConn.query("SHOW TABLES");
  console.log("MySQL Tables:", tables.map(t => Object.values(t)[0]));
  await myConn.end();
}

check();
