import { db } from "@/lib/db"
import { systemMetrics } from "@/db/schema"
import { sql } from "drizzle-orm"
import { and, eq, gte, lte, asc } from "drizzle-orm"

// Check system health
export async function checkSystemHealth() {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection()

    // Check API services
    const apiStatus = await checkApiServices()

    // Check storage
    const storageStatus = await checkStorage()

    // Log health check
    await logHealthCheck({
      database: dbStatus,
      api: apiStatus,
      storage: storageStatus,
    })

    return {
      status: "healthy",
      services: {
        database: dbStatus,
        api: apiStatus,
        storage: storageStatus,
      },
      timestamp: new Date(),
    }
  } catch (error) {
    console.error("Health check error:", error)
    return {
      status: "error",
      message: error.message,
      timestamp: new Date(),
    }
  }
}

// Check database connection
async function checkDatabaseConnection() {
  try {
    // Try to execute a simple query
    await db.execute(sql`SELECT 1`)
    return { status: "healthy" }
  } catch (error) {
    console.error("Database connection error:", error)
    return { status: "error", message: error.message }
  }
}

// Check API services
async function checkApiServices() {
  try {
    // Check external API services
    // This is a placeholder for actual API checks
    return { status: "healthy" }
  } catch (error) {
    console.error("API services error:", error)
    return { status: "error", message: error.message }
  }
}

// Check storage
async function checkStorage() {
  try {
    // Check storage services
    // This is a placeholder for actual storage checks
    return { status: "healthy" }
  } catch (error) {
    console.error("Storage error:", error)
    return { status: "error", message: error.message }
  }
}

// Log health check
async function logHealthCheck(status) {
  try {
    await db.insert(systemMetrics).values({
      type: "HEALTH_CHECK",
      status: JSON.stringify(status),
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Error logging health check:", error)
  }
}

// Get system metrics
export async function getSystemMetrics(type, startDate, endDate) {
  try {
    const metrics = await db
      .select()
      .from(systemMetrics)
      .where(
        and(
          eq(systemMetrics.type, type),
          gte(systemMetrics.timestamp, startDate),
          lte(systemMetrics.timestamp, endDate),
        ),
      )
      .orderBy(asc(systemMetrics.timestamp))

    return metrics
  } catch (error) {
    console.error("Error getting system metrics:", error)
    return []
  }
}

// Log error
export async function logError(source, message, details) {
  try {
    await db.insert(systemMetrics).values({
      type: "ERROR",
      source,
      status: JSON.stringify({
        message,
        details,
      }),
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Error logging error:", error)
  }
}

// Log performance metric
export async function logPerformance(operation, duration, details) {
  try {
    await db.insert(systemMetrics).values({
      type: "PERFORMANCE",
      source: operation,
      status: JSON.stringify({
        duration,
        details,
      }),
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Error logging performance:", error)
  }
}

