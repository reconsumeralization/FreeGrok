import { db } from "../lib/db"
import * as schema from "../db/schema"
import fs from "fs"

// This script migrates data from JSON files to Drizzle
async function main() {
  console.log("Starting data migration...")

  try {
    // Check if data files exist
    if (fs.existsSync("./data/users.json")) {
      // Migrate users
      const usersData = JSON.parse(fs.readFileSync("./data/users.json", "utf8"))
      console.log(`Migrating ${usersData.length} users...`)

      for (const user of usersData) {
        await db.insert(schema.users).values({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          password: user.password,
          image: user.image,
          role: user.role || "USER",
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        })
      }
    }

    // Add more migrations for other tables as needed
    // ...

    console.log("Migration completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

main()

