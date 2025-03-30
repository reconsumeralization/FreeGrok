import { NextResponse } from "next/server"
import { requireAuth, hasPermission } from "@/lib/auth"
import { checkSystemHealth } from "@/lib/monitoring"

export async function GET() {
  try {
    const user = await requireAuth()

    // Check if user has admin permission
    if (!hasPermission(user, "manage_settings")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Check system health
    const healthStatus = await checkSystemHealth()

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check system health",
        error: error.message,
        timestamp: new Date(),
      },
      { status: 500 },
    )
  }
}

