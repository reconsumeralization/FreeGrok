import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "@/db/schema"

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema })

// Helper function to get a client from the pool for transactions
export async function getClient() {
  const client = await pool.connect()
  return client
}

// Helper function to release a client back to the pool
export function releaseClient(client) {
  client.release()
}

// Helper function to execute a transaction
export async function transaction(callback) {
  const client = await getClient()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    releaseClient(client)
  }
}
