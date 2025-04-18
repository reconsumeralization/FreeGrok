import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import * as schema from "./schema"

// This script runs Drizzle migrations
async function main() {
  console.log("Running database migrations...")

  try {
    // Create a PostgreSQL connection
    const connectionString = process.env.DATABASE_URL
    const sql = postgres(connectionString, { max: 1 })

    // Create a Drizzle instance
    const db = drizzle(sql, { schema })

    // Run migrations
    await migrate(db, { migrationsFolder: "./drizzle" })

    console.log("Migrations completed successfully!")

    // Close the connection
    await sql.end()
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

main()

