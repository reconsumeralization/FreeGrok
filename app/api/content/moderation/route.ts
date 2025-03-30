import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, hasPermission } from "@/lib/auth"
import { moderateContent } from "@/lib/moderation"
import { activityLog, report, post, comment } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// Handle content moderation requests
export async function POST(req) {
  try {
    const user = await requireAuth()

    // Check if user has permission to moderate content
    if (!hasPermission(user, "manage_content")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const { content, contentType } = await req.json()

    // Validate request
    if (!content || !contentType) {
      return NextResponse.json({ message: "Content and contentType are required" }, { status: 400 })
    }

    // Moderate content using AI service
    const moderationResult = await moderateContent(content)

    // Log moderation activity
    await db.insert(activityLog).values({
      userId: user.id,
      action: "CONTENT_MODERATION",
      details: {
        contentType,
        moderationResult,
      },
    })

    return NextResponse.json({
      result: moderationResult,
    })
  } catch (error) {
    console.error("Content moderation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Handle report resolution
export async function PUT(req) {
  try {
    const user = await requireAuth()

    // Check if user has permission to moderate content
    if (!hasPermission(user, "manage_content")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    const { reportId, status, note } = await req.json()

    // Validate request
    if (!reportId || !status) {
      return NextResponse.json({ message: "Report ID and status are required" }, { status: 400 })
    }

    // Update report status
    const [updatedReport] = await db
      .update(report)
      .set({
        status,
        moderatorId: user.id,
        moderatorNote: note,
        updatedAt: new Date(),
      })
      .where(eq(report.id, reportId))
      .returning()

    // If report is actioned, take appropriate action on the content
    if (status === "ACTIONED") {
      if (updatedReport.postId) {
        await db.update(post).set({ visibility: "PRIVATE" }).where(eq(post.id, updatedReport.postId))
      } else if (updatedReport.commentId) {
        await db.delete(comment).where(eq(comment.id, updatedReport.commentId))
      }
    }

    return NextResponse.json({
      message: "Report updated successfully",
      report: updatedReport,
    })
  } catch (error) {
    console.error("Report resolution error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

