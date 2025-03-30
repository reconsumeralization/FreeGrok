import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import * as schema from "../db/schema"

// Initialize SQLite database
const sqlite = new Database(process.env.DATABASE_URL || "db.sqlite")
const db = drizzle(sqlite, { schema })

// Run migrations
async function main() {
  console.log("Running migrations...")

  try {
    // This will automatically run needed migrations on the database
    migrate(db, { migrationsFolder: "./drizzle" })
    console.log("Migrations completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

main()

