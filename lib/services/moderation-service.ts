import { db } from "@/lib/db"
import { posts, comments, reports, users } from "@/lib/db/schema"
import { eq, and, desc, isNull, count } from "drizzle-orm"

export enum ContentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  FLAGGED = "flagged",
}

export interface ContentModerationItem {
  id: string
  type: "post" | "comment"
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  status: ContentStatus
  flaggedReason?: string
  moderatedBy?: string
  moderatedAt?: Date
}

/**
 * AI-powered content moderation
 */
export async function moderateContent(content: string): Promise<{
  isFlagged: boolean
  flaggedCategories: string[]
  scores: Record<string, number>
}> {
  try {
    // In a real implementation, this would call an AI service like OpenAI's moderation API
    // For this example, we'll use a simple keyword-based approach

    const prohibitedKeywords = [
      "offensive",
      "inappropriate",
      "hate",
      "spam",
      "scam",
      "fraud",
      "illegal",
      "violent",
      "harassment",
      "discrimination",
    ]

    const contentLower = content.toLowerCase()
    const flaggedCategories: string[] = []
    const scores: Record<string, number> = {}

    // Check for prohibited keywords
    prohibitedKeywords.forEach((keyword) => {
      if (contentLower.includes(keyword)) {
        flaggedCategories.push(keyword)
        scores[keyword] = 0.9 // High confidence score
      } else {
        scores[keyword] = 0.1 // Low confidence score
      }
    })

    return {
      isFlagged: flaggedCategories.length > 0,
      flaggedCategories,
      scores,
    }
  } catch (error) {
    console.error("Content moderation error:", error)
    return {
      isFlagged: false,
      flaggedCategories: [],
      scores: {},
    }
  }
}

/**
 * Get content items that need moderation
 */
export async function getContentForModeration(
  status: ContentStatus = ContentStatus.PENDING,
  page = 1,
  pageSize = 20,
): Promise<{ items: ContentModerationItem[]; totalCount: number }> {
  const skip = (page - 1) * pageSize

  try {
    // Get flagged posts
    const flaggedPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.userId,
        authorName: users.name,
        createdAt: posts.createdAt,
        status: posts.moderationStatus,
        flaggedReason: posts.moderationReason,
        moderatedBy: posts.moderatedById,
        moderatedAt: posts.moderatedAt,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(and(eq(posts.moderationStatus, status), isNull(posts.deletedAt)))
      .orderBy(desc(posts.createdAt))
      .limit(pageSize)
      .offset(skip)

    // Get flagged comments
    const flaggedComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        authorId: comments.userId,
        authorName: users.name,
        createdAt: comments.createdAt,
        status: comments.moderationStatus,
        flaggedReason: comments.moderationReason,
        moderatedBy: comments.moderatedById,
        moderatedAt: comments.moderatedAt,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.moderationStatus, status), isNull(comments.deletedAt)))
      .orderBy(desc(comments.createdAt))
      .limit(pageSize)
      .offset(skip)

    // Format posts
    const formattedPosts: ContentModerationItem[] = flaggedPosts.map((post) => ({
      id: post.id,
      type: "post",
      content: post.content,
      authorId: post.authorId,
      authorName: post.authorName || "Unknown User",
      createdAt: post.createdAt,
      status: post.status as ContentStatus,
      flaggedReason: post.flaggedReason || undefined,
      moderatedBy: post.moderatedBy || undefined,
      moderatedAt: post.moderatedAt || undefined,
    }))

    // Format comments
    const formattedComments: ContentModerationItem[] = flaggedComments.map((comment) => ({
      id: comment.id,
      type: "comment",
      content: comment.content,
      authorId: comment.authorId,
      authorName: comment.authorName || "Unknown User",
      createdAt: comment.createdAt,
      status: comment.status as ContentStatus,
      flaggedReason: comment.flaggedReason || undefined,
      moderatedBy: comment.moderatedBy || undefined,
      moderatedAt: comment.moderatedAt || undefined,
    }))

    // Combine and sort by creation date
    const combinedItems = [...formattedPosts, ...formattedComments]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, pageSize)

    // Get total count
    const totalPostsResult = await db
      .select({ count: count() })
      .from(posts)
      .where(and(eq(posts.moderationStatus, status), isNull(posts.deletedAt)))

    const totalCommentsResult = await db
      .select({ count: count() })
      .from(comments)
      .where(and(eq(comments.moderationStatus, status), isNull(comments.deletedAt)))

    const totalCount = (totalPostsResult[0]?.count || 0) + (totalCommentsResult[0]?.count || 0)

    return {
      items: combinedItems,
      totalCount,
    }
  } catch (error) {
    console.error("Error fetching content for moderation:", error)
    throw new Error("Failed to fetch content for moderation")
  }
}

/**
 * Moderate a content item
 */
export async function moderateContentItem(
  id: string,
  type: "post" | "comment",
  status: ContentStatus,
  moderatorId: string,
  reason?: string,
): Promise<boolean> {
  try {
    const now = new Date()

    if (type === "post") {
      await db
        .update(posts)
        .set({
          moderationStatus: status,
          moderationReason: reason,
          moderatedById: moderatorId,
          moderatedAt: now,
          updatedAt: now,
        })
        .where(eq(posts.id, id))
    } else {
      await db
        .update(comments)
        .set({
          moderationStatus: status,
          moderationReason: reason,
          moderatedById: moderatorId,
          moderatedAt: now,
          updatedAt: now,
        })
        .where(eq(comments.id, id))
    }

    return true
  } catch (error) {
    console.error("Error moderating content:", error)
    throw new Error("Failed to moderate content")
  }
}

/**
 * Auto-moderate content using AI
 */
export async function autoModerateContent(content: string): Promise<{
  status: ContentStatus
  reason?: string
}> {
  try {
    const moderationResult = await moderateContent(content)

    if (moderationResult.isFlagged) {
      return {
        status: ContentStatus.FLAGGED,
        reason: `Flagged for: ${moderationResult.flaggedCategories.join(", ")}`,
      }
    }

    return {
      status: ContentStatus.APPROVED,
    }
  } catch (error) {
    console.error("Auto-moderation error:", error)
    return {
      status: ContentStatus.PENDING,
      reason: "Auto-moderation failed, manual review required",
    }
  }
}

/**
 * Report content
 */
export async function reportContent(
  reportedById: string,
  contentType: "post" | "comment",
  contentId: string,
  reason: string,
  description?: string,
): Promise<boolean> {
  try {
    // Create report
    await db.insert(reports).values({
      reportedById,
      postId: contentType === "post" ? contentId : undefined,
      commentId: contentType === "comment" ? contentId : undefined,
      reason,
      description,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Update content status to pending moderation
    if (contentType === "post") {
      await db
        .update(posts)
        .set({
          moderationStatus: ContentStatus.PENDING,
          moderationReason: `Reported for: ${reason}`,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, contentId))
    } else {
      await db
        .update(comments)
        .set({
          moderationStatus: ContentStatus.PENDING,
          moderationReason: `Reported for: ${reason}`,
          updatedAt: new Date(),
        })
        .where(eq(comments.id, contentId))
    }

    return true
  } catch (error) {
    console.error("Error reporting content:", error)
    throw new Error("Failed to report content")
  }
}

/**
 * Get moderation statistics
 */
export async function getModerationStats(): Promise<{
  pending: number
  approved: number
  rejected: number
  flagged: number
}> {
  try {
    const postStats = await db
      .select({
        status: posts.moderationStatus,
        count: count(),
      })
      .from(posts)
      .where(isNull(posts.deletedAt))
      .groupBy(posts.moderationStatus)

    const commentStats = await db
      .select({
        status: comments.moderationStatus,
        count: count(),
      })
      .from(comments)
      .where(isNull(comments.deletedAt))
      .groupBy(comments.moderationStatus)

    // Combine stats
    const statsMap = new Map<ContentStatus, number>()

    postStats.forEach((stat) => {
      statsMap.set(stat.status as ContentStatus, (statsMap.get(stat.status as ContentStatus) || 0) + stat.count)
    })

    commentStats.forEach((stat) => {
      statsMap.set(stat.status as ContentStatus, (statsMap.get(stat.status as ContentStatus) || 0) + stat.count)
    })

    return {
      pending: statsMap.get(ContentStatus.PENDING) || 0,
      approved: statsMap.get(ContentStatus.APPROVED) || 0,
      rejected: statsMap.get(ContentStatus.REJECTED) || 0,
      flagged: statsMap.get(ContentStatus.FLAGGED) || 0,
    }
  } catch (error) {
    console.error("Error fetching moderation stats:", error)
    return {
      pending: 0,
      approved: 0,
      rejected: 0,
      flagged: 0,
    }
  }
}

