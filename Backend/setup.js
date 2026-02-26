const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    // First, create connection without database to drop and recreate the database
    const connectionNoDb = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      multipleStatements: true
    });

    console.log('✓ Connected to MySQL server');

    // Drop existing database if it exists
    await connectionNoDb.query('DROP DATABASE IF EXISTS admission_db');
    console.log('✓ Dropped existing database (if any)');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute the entire SQL file with multipleStatements enabled
    await connectionNoDb.query(sql);

    console.log('✓ Database created');
    console.log('✓ All tables created successfully');

    await connectionNoDb.end();
    console.log('✓ Database initialization complete');
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    process.exit(1);
  }
}

module.exports = initializeDatabase();
