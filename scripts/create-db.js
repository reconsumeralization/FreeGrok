const { Client } = require('pg');

async function createDatabase() {
  // Connect to the default 'postgres' database first
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '3639',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check if the database already exists
    const checkResult = await client.query("SELECT 1 FROM pg_database WHERE datname = 'b2b_network'");
    
    if (checkResult.rowCount === 0) {
      // Create the database if it doesn't exist
      console.log('Creating b2b_network database...');
      await client.query('CREATE DATABASE b2b_network');
      console.log('Database b2b_network created successfully!');
    } else {
      console.log('Database b2b_network already exists.');
    }
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
