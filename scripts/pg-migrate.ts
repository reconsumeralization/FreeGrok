import { migrate } from "drizzle-orm/postgres-js/migrator"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as dotenv from "dotenv"
import * as schema from "../db/schema"

// Load environment variables
dotenv.config({ path: ".env.development" })

// Ensure DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is not set")
  process.exit(1)
}

// Initialize PostgreSQL connection
const client = postgres(databaseUrl)
const db = drizzle(client, { schema })

// Run migrations
async function main() {
  console.log("Running PostgreSQL migrations...")

  try {
    await migrate(db, { migrationsFolder: "./drizzle" })
    console.log("Migrations completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
