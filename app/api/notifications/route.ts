import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { requireAuth } from "@/lib/auth"
import { eq, count, desc, and } from "drizzle-orm"

export async function GET(req) {
  try {
    const user = await requireAuth()

    // Get pagination parameters
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Get notifications for user
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(skip)

    // Get unread count
    const unreadCountResult = await db
      .select({ value: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))

    const unreadCount = unreadCountResult[0]?.value || 0

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount,
      page,
      limit,
    })
  } catch (error) {
    console.error("Fetch notifications error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await requireAuth()
    const { recipientId, type, content, link } = await req.json()

    // Validate request
    if (!recipientId || !type || !content) {
      return NextResponse.json({ message: "Recipient ID, type, and content are required" }, { status: 400 })
    }

    // Create notification
    const newNotification = await db
      .insert(notifications)
      .values({
        userId: recipientId,
        type,
        content,
        link,
        isRead: false,
      })
      .returning()

    return NextResponse.json({
      notification: newNotification[0],
    })
  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

