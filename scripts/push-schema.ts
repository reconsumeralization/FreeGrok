import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import * as dotenv from "dotenv"
import * as schema from "../db/schema"

// Load environment variables
dotenv.config({ path: ".env.development" })

// Get database connection string
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is not set")
  process.exit(1)
}

// Function to push schema to database
async function pushSchema() {
  console.log("Connecting to database:", databaseUrl)
  
  // Create a postgres connection
  const migrationClient = postgres(databaseUrl, { max: 1 })
  
  // Create a drizzle instance with the schema
  const db = drizzle(migrationClient, { schema })
  
  try {
    console.log("Pushing schema to database...")
    
    // Create tables if they don't exist
    const queries = [`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        email_verified TIMESTAMP,
        password TEXT,
        image TEXT,
        role TEXT DEFAULT 'USER' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT
      );
      
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        session_token TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `]
    
    // Execute the queries
    for (const query of queries) {
      await migrationClient.unsafe(query)
    }
    
    console.log("Schema pushed successfully!")
  } catch (error) {
    console.error("Error pushing schema:", error)
    process.exit(1)
  } finally {
    // Close the database connection
    await migrationClient.end()
  }
}

// Run the schema push
pushSchema()
