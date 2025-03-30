import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { requireAuth } from "@/lib/auth"
import { eq, and } from "drizzle-orm"

export async function PUT() {
  try {
    const user = await requireAuth()

    // Mark all notifications as read
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

