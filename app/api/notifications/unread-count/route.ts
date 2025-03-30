import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { requireAuth } from "@/lib/auth"
import { eq, and, count } from "drizzle-orm"

export async function GET() {
  try {
    const user = await requireAuth()

    // Get unread count
    const unreadCountResult = await db
      .select({ value: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))

    const unreadCount = unreadCountResult[0]?.value || 0

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error("Fetch unread count error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

