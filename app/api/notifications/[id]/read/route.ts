import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { requireAuth } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function PUT(req, { params }) {
  try {
    const user = await requireAuth()
    const { id } = params

    // Find notification
    const notificationResult = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1)

    const notification = notificationResult[0]

    if (!notification) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 })
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Mark notification as read
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notification as read error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

