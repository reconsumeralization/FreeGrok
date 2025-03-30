import { db } from "@/lib/db"
import { posts, likes, comments, users, connections, messages, activityLogs } from "@/lib/db/schema"
import { eq, and, count, desc, sql, gte, inArray } from "drizzle-orm"

export interface EngagementMetrics {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalConnections: number
  totalMessages: number
  activeUsers: number
  engagementRate: number
  topPosts: {
    id: string
    content: string
    authorName: string
    likes: number
    comments: number
  }[]
}

export interface UserEngagement {
  userId: string
  name: string
  postsCount: number
  likesReceived: number
  commentsReceived: number
  connectionsCount: number
  lastActive: Date
  engagementScore: number
}

export interface ContentPerformance {
  id: string
  type: "post" | "comment"
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  likes: number
  comments: number
  views: number
  engagementRate: number
  shareCount: number
}

/**
 * Get platform engagement metrics
 */
export async function getPlatformEngagementMetrics(
  timeRange: "day" | "week" | "month" | "year" = "week",
): Promise<EngagementMetrics> {
  try {
    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "day":
        startDate = new Date(now.setDate(now.getDate() - 1))
        break
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
    }

    // Get total posts in time range
    const postsResult = await db.select({ count: count() }).from(posts).where(gte(posts.createdAt, startDate))

    const totalPosts = postsResult[0]?.count || 0

    // Get total likes in time range
    const likesResult = await db.select({ count: count() }).from(likes).where(gte(likes.createdAt, startDate))

    const totalLikes = likesResult[0]?.count || 0

    // Get total comments in time range
    const commentsResult = await db.select({ count: count() }).from(comments).where(gte(comments.createdAt, startDate))

    const totalComments = commentsResult[0]?.count || 0

    // Get total new connections in time range
    const connectionsResult = await db
      .select({ count: count() })
      .from(connections)
      .where(and(gte(connections.createdAt, startDate), eq(connections.status, "ACCEPTED")))

    const totalConnections = connectionsResult[0]?.count || 0

    // Get total messages in time range
    const messagesResult = await db.select({ count: count() }).from(messages).where(gte(messages.createdAt, startDate))

    const totalMessages = messagesResult[0]?.count || 0

    // Get active users in time range
    const activeUsersResult = await db
      .select({ count: count() })
      .from(activityLogs)
      .where(gte(activityLogs.createdAt, startDate))
      .groupBy(activityLogs.userId)

    const activeUsers = activeUsersResult.length

    // Get total users
    const totalUsersResult = await db.select({ count: count() }).from(users)

    const totalUsers = totalUsersResult[0]?.count || 1 // Avoid division by zero

    // Calculate engagement rate (active users / total users)
    const engagementRate = activeUsers / totalUsers

    // Get top posts by engagement
    const topPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.userId,
        authorName: users.name,
        likesCount: count(likes.id),
        commentsCount: count(comments.id),
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .where(gte(posts.createdAt, startDate))
      .groupBy(posts.id, users.name)
      .orderBy(desc(sql`COUNT(${likes.id}) + COUNT(${comments.id}) * 2`))
      .limit(5)

    return {
      totalPosts,
      totalLikes,
      totalComments,
      totalConnections,
      totalMessages,
      activeUsers,
      engagementRate,
      topPosts: topPosts.map((post) => ({
        id: post.id,
        content: post.content.length > 100 ? post.content.substring(0, 97) + "..." : post.content,
        authorName: post.authorName,
        likes: post.likesCount,
        comments: post.commentsCount,
      })),
    }
  } catch (error) {
    console.error("Error fetching platform engagement metrics:", error)
    return {
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      totalConnections: 0,
      totalMessages: 0,
      activeUsers: 0,
      engagementRate: 0,
      topPosts: [],
    }
  }
}

/**
 * Get top engaged users
 */
export async function getTopEngagedUsers(
  limit = 10,
  timeRange: "week" | "month" | "year" = "month",
): Promise<UserEngagement[]> {
  try {
    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
    }

    // Get user activity metrics
    const userPosts = await db
      .select({
        userId: posts.userId,
        count: count(),
      })
      .from(posts)
      .where(gte(posts.createdAt, startDate))
      .groupBy(posts.userId)

    const userLikesReceived = await db
      .select({
        userId: posts.userId,
        count: count(),
      })
      .from(likes)
      .leftJoin(posts, eq(likes.postId, posts.id))
      .where(gte(likes.createdAt, startDate))
      .groupBy(posts.userId)

    const userCommentsReceived = await db
      .select({
        userId: posts.userId,
        count: count(),
      })
      .from(comments)
      .leftJoin(posts, eq(comments.postId, posts.id))
      .where(gte(comments.createdAt, startDate))
      .groupBy(posts.userId)

    const userConnections = await db
      .select({
        userId: connections.senderId,
        count: count(),
      })
      .from(connections)
      .where(and(gte(connections.createdAt, startDate), eq(connections.status, "ACCEPTED")))
      .groupBy(connections.senderId)
      .union(
        db
          .select({
            userId: connections.receiverId,
            count: count(),
          })
          .from(connections)
          .where(and(gte(connections.createdAt, startDate), eq(connections.status, "ACCEPTED")))
          .groupBy(connections.receiverId),
      )

    const userLastActivity = await db
      .select({
        userId: activityLogs.userId,
        lastActive: sql<Date>`MAX(${activityLogs.createdAt})`,
      })
      .from(activityLogs)
      .groupBy(activityLogs.userId)

    // Create maps for easy lookup
    const postsMap = new Map(userPosts.map((item) => [item.userId, item.count]))
    const likesMap = new Map(userLikesReceived.map((item) => [item.userId, item.count]))
    const commentsMap = new Map(userCommentsReceived.map((item) => [item.userId, item.count]))
    const connectionsMap = new Map(userConnections.map((item) => [item.userId, item.count]))
    const lastActivityMap = new Map(userLastActivity.map((item) => [item.userId, item.lastActive]))

    // Get all active users
    const activeUserIds = new Set([
      ...postsMap.keys(),
      ...likesMap.keys(),
      ...commentsMap.keys(),
      ...connectionsMap.keys(),
    ])

    if (activeUserIds.size === 0) {
      return []
    }

    // Get user details
    const userDetails = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(inArray(users.id, [...activeUserIds]))

    // Calculate engagement scores and format results
    const userEngagements: UserEngagement[] = userDetails.map((user) => {
      const postsCount = postsMap.get(user.id) || 0
      const likesReceived = likesMap.get(user.id) || 0
      const commentsReceived = commentsMap.get(user.id) || 0
      const connectionsCount = connectionsMap.get(user.id) || 0
      const lastActive = lastActivityMap.get(user.id) || new Date()

      // Calculate engagement score
      // Posts: 5 points each
      // Likes received: 1 point each
      // Comments received: 3 points each
      // New connections: 10 points each
      const engagementScore = postsCount * 5 + likesReceived * 1 + commentsReceived * 3 + connectionsCount * 10

      return {
        userId: user.id,
        name: user.name,
        postsCount,
        likesReceived,
        commentsReceived,
        connectionsCount,
        lastActive,
        engagementScore,
      }
    })

    // Sort by engagement score and return top users
    return userEngagements.sort((a, b) => b.engagementScore - a.engagementScore).slice(0, limit)
  } catch (error) {
    console.error("Error fetching top engaged users:", error)
    return []
  }
}

/**
 * Get content performance metrics
 */
export async function getContentPerformance(
  contentId: string,
  contentType: "post" | "comment",
): Promise<ContentPerformance | null> {
  try {
    if (contentType === "post") {
      const postPerformance = await db
        .select({
          id: posts.id,
          content: posts.content,
          authorId: posts.userId,
          authorName: users.name,
          createdAt: posts.createdAt,
          likesCount: count(likes.id),
          commentsCount: count(comments.id),
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .leftJoin(likes, eq(posts.id, likes.postId))
        .leftJoin(comments, eq(posts.id, comments.postId))
        .where(eq(posts.id, contentId))
        .groupBy(posts.id, users.name)
        .limit(1)

      if (postPerformance.length === 0) {
        return null
      }

      const post = postPerformance[0]

      // Estimate views (in a real app, this would be tracked)
      const estimatedViews = Math.max(post.likesCount * 5 + post.commentsCount * 3, 10)

      // Calculate engagement rate
      const engagementRate = (post.likesCount + post.commentsCount) / estimatedViews

      return {
        id: post.id,
        type: "post",
        content: post.content,
        authorId: post.authorId,
        authorName: post.authorName,
        createdAt: post.createdAt,
        likes: post.likesCount,
        comments: post.commentsCount,
        views: estimatedViews,
        engagementRate,
        shareCount: 0, // Would be tracked in a real app
      }
    } else {
      // Similar implementation for comments
      return null
    }
  } catch (error) {
    console.error("Error fetching content performance:", error)
    return null
  }
}

/**
 * Track user activity
 */
export async function trackUserActivity(
  userId: string,
  action: string,
  details?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      userId,
      action,
      details: details || {},
      ipAddress,
      userAgent,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Error tracking user activity:", error)
  }
}

/**
 * Get content engagement over time
 */
export async function getContentEngagementOverTime(
  contentId: string,
  timeRange: "day" | "week" | "month" = "week",
): Promise<{
  dates: string[]
  likes: number[]
  comments: number[]
}> {
  try {
    // Calculate date range
    const now = new Date()
    let startDate: Date
    let interval: string

    switch (timeRange) {
      case "day":
        startDate = new Date(now.setDate(now.getDate() - 1))
        interval = "hour"
        break
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7))
        interval = "day"
        break
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        interval = "day"
        break
    }

    // In a real implementation, this would query time-series data
    // For this example, return placeholder data

    const dates: string[] = []
    const likesData: number[] = []
    const commentsData: number[] = []

    // Generate sample data
    if (interval === "hour") {
      for (let i = 0; i < 24; i++) {
        const date = new Date(now)
        date.setHours(date.getHours() - (23 - i))
        dates.push(date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
        likesData.push(Math.floor(Math.random() * 10))
        commentsData.push(Math.floor(Math.random() * 5))
      }
    } else {
      for (let i = 0; i < (timeRange === "week" ? 7 : 30); i++) {
        const date = new Date(now)
        date.setDate(date.getDate() - ((timeRange === "week" ? 7 : 30) - 1 - i))
        dates.push(date.toLocaleDateString([], { month: "short", day: "numeric" }))
        likesData.push(Math.floor(Math.random() * 20))
        commentsData.push(Math.floor(Math.random() * 10))
      }
    }

    return {
      dates,
      likes: likesData,
      comments: commentsData,
    }
  } catch (error) {
    console.error("Error fetching content engagement over time:", error)
    return {
      dates: [],
      likes: [],
      comments: [],
    }
  }
}

