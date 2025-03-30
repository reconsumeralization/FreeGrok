import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"

// Create a PostgreSQL connection
const connectionString = process.env.DATABASE_URL

// For server-side only
const client = postgres(connectionString)

// Create a Drizzle ORM instance
export const db = drizzle(client, { schema })

