import { db } from "@/lib/db"
import { reports, posts, comments, users } from "@/db/schema"
import { eq, count } from "drizzle-orm"

// Moderate content using AI service
export async function moderateContent(content) {
  try {
    // This is a placeholder for actual AI-based content moderation
    // In a real implementation, this would call an AI service API

    // Simple keyword-based moderation for demonstration
    const prohibitedKeywords = ["hate", "violence", "illegal", "spam", "scam"]

    const contentLower = content.toLowerCase()
    const foundKeywords = prohibitedKeywords.filter((keyword) => contentLower.includes(keyword))

    const isFlagged = foundKeywords.length > 0

    return {
      isFlagged,
      flaggedKeywords: foundKeywords,
      confidenceScore: isFlagged ? 0.85 : 0.15,
      moderationTimestamp: new Date(),
    }
  } catch (error) {
    console.error("Content moderation error:", error)
    return {
      isFlagged: true,
      error: error.message,
      moderationTimestamp: new Date(),
    }
  }
}

// Report content
export async function reportContent(userId, contentType, contentId, reason) {
  try {
    // Validate content exists
    let contentExists = false

    if (contentType === "POST") {
      const post = await db.select().from(posts).where(eq(posts.id, contentId)).limit(1)
      contentExists = post.length > 0
    } else if (contentType === "COMMENT") {
      const comment = await db.select().from(comments).where(eq(comments.id, contentId)).limit(1)
      contentExists = comment.length > 0
    }

    if (!contentExists) {
      throw new Error("Content not found")
    }

    // Create report
    const [report] = await db
      .insert(reports)
      .values({
        reporterId: userId,
        contentType,
        postId: contentType === "POST" ? contentId : null,
        commentId: contentType === "COMMENT" ? contentId : null,
        reason,
        status: "PENDING",
      })
      .returning()

    return report
  } catch (error) {
    console.error("Report content error:", error)
    throw error
  }
}

// Get pending reports
export async function getPendingReports(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit

    const pendingReports = await db
      .select({
        report: reports,
        reporter: users,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reporterId, users.id))
      .where(eq(reports.status, "PENDING"))
      .limit(limit)
      .offset(skip)

    const totalCount = await db.select({ count: count() }).from(reports).where(eq(reports.status, "PENDING"))

    return {
      reports: pendingReports,
      total: totalCount[0].count,
      page,
      limit,
    }
  } catch (error) {
    console.error("Get pending reports error:", error)
    throw error
  }
}

// Get report details
export async function getReportDetails(reportId) {
  try {
    const report = await db
      .select({
        report: reports,
        reporter: users,
      })
      .from(reports)
      .leftJoin(users, eq(reports.reporterId, users.id))
      .where(eq(reports.id, reportId))
      .limit(1)

    if (report.length === 0) {
      throw new Error("Report not found")
    }

    // Get reported content
    let reportedContent = null

    if (report[0].report.contentType === "POST") {
      const post = await db
        .select({
          post: posts,
          author: users,
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .where(eq(posts.id, report[0].report.postId))
        .limit(1)

      if (post.length > 0) {
        reportedContent = {
          type: "POST",
          content: post[0].post,
          author: post[0].author,
        }
      }
    } else if (report[0].report.contentType === "COMMENT") {
      const comment = await db
        .select({
          comment: comments,
          author: users,
        })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.id, report[0].report.commentId))
        .limit(1)

      if (comment.length > 0) {
        reportedContent = {
          type: "COMMENT",
          content: comment[0].comment,
          author: comment[0].author,
        }
      }
    }

    return {
      report: report[0].report,
      reporter: report[0].reporter,
      reportedContent,
    }
  } catch (error) {
    console.error("Get report details error:", error)
    throw error
  }
}

