import { db } from "@/lib/db"
import { posts, users, connections, businessProfiles, professionalProfiles, likes, comments } from "@/lib/db/schema"
import { eq, and, or, desc, sql, inArray, not, isNull, gte } from "drizzle-orm"
import { autoModerateContent } from "./moderation-service"
import { trackUserActivity } from "./analytics-service"

// Content types for the feed
export enum ContentType {
  POST = "post",
  ARTICLE = "article",
  UPDATE = "update",
  NEWS = "news",
  EVENT = "event",
}

// Relevance types for sorting
export enum RelevanceType {
  RECENT = "recent",
  POPULAR = "popular",
  RELEVANT = "relevant",
}

// Feed item interface
export interface FeedItem {
  id: string
  type: ContentType
  content: string
  title?: string
  authorId: string
  authorName: string
  authorRole?: string
  authorCompany?: string
  authorImage?: string
  createdAt: Date
  updatedAt?: Date
  media?: string[]
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isShared: boolean
  relevanceScore?: number
  tags?: string[]
  url?: string
  source?: string
}

// Feed filter options
export interface FeedFilterOptions {
  contentTypes?: ContentType[]
  relevance?: RelevanceType
  timeRange?: "today" | "week" | "month" | "all"
  tags?: string[]
  sources?: string[]
  onlyConnections?: boolean
  industries?: string[]
}

// Default filter options
const defaultFilterOptions: FeedFilterOptions = {
  contentTypes: Object.values(ContentType),
  relevance: RelevanceType.RECENT,
  timeRange: "all",
  onlyConnections: false,
}

/**
 * Get personalized feed for a user
 */
export async function getPersonalizedFeed(
  userId: string,
  page = 1,
  pageSize = 10,
  filterOptions: FeedFilterOptions = defaultFilterOptions,
): Promise<{ items: FeedItem[]; totalCount: number }> {
  try {
    const skip = (page - 1) * pageSize

    // Get user's connections
    const userConnections = await db
      .select({ connectionId: connections.receiverId })
      .from(connections)
      .where(and(eq(connections.senderId, userId), eq(connections.status, "ACCEPTED")))
      .union(
        db
          .select({ connectionId: connections.senderId })
          .from(connections)
          .where(and(eq(connections.receiverId, userId), eq(connections.status, "ACCEPTED"))),
      )

    const connectionIds = userConnections.map((c) => c.connectionId)

    // Get user's profile to understand interests
    const userProfile = await db
      .select({
        professionalIndustry: professionalProfiles.industry,
        professionalSkills: professionalProfiles.skills,
        businessIndustry: businessProfiles.industry,
      })
      .from(users)
      .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .where(eq(users.id, userId))
      .limit(1)

    const userIndustry = userProfile[0]?.professionalIndustry || userProfile[0]?.businessIndustry
    const userSkills = userProfile[0]?.professionalSkills || []

    // Build where clause based on filter options
    let whereClause = isNull(posts.deletedAt)

    // Time range filter
    if (filterOptions.timeRange && filterOptions.timeRange !== "all") {
      let dateLimit: Date
      const now = new Date()

      switch (filterOptions.timeRange) {
        case "today":
          dateLimit = new Date(now.setHours(0, 0, 0, 0))
          break
        case "week":
          dateLimit = new Date(now.setDate(now.getDate() - 7))
          break
        case "month":
          dateLimit = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          dateLimit = new Date(0) // Beginning of time
      }

      whereClause = and(whereClause, gte(posts.createdAt, dateLimit))
    }

    // Only show posts from connections if specified
    if (filterOptions.onlyConnections && connectionIds.length > 0) {
      whereClause = and(whereClause, inArray(posts.userId, connectionIds))
    } else {
      // Otherwise show public posts and posts from connections
      whereClause = and(
        whereClause,
        or(eq(posts.visibility, "PUBLIC"), inArray(posts.userId, [...connectionIds, userId])),
      )
    }

    // Industry filter
    if (filterOptions.industries && filterOptions.industries.length > 0) {
      whereClause = and(
        whereClause,
        or(...filterOptions.industries.map((industry) => sql`${posts.content} ILIKE ${`%${industry}%`}`)),
      )
    }

    // Tag filter
    if (filterOptions.tags && filterOptions.tags.length > 0) {
      whereClause = and(whereClause, or(...filterOptions.tags.map((tag) => sql`${posts.content} ILIKE ${`%#${tag}%`}`)))
    }

    // Get posts with author information
    const feedItems = await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.userId,
        authorName: users.name,
        authorRole: professionalProfiles.title,
        authorCompany: businessProfiles.companyName,
        authorImage: users.image,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        media: posts.media,
        sharedPostId: posts.sharedPostId,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .where(whereClause)
      .orderBy(getSortOrder(filterOptions.relevance))
      .limit(pageSize)
      .offset(skip)

    // Get like and comment counts for each post
    const postIds = feedItems.map((item) => item.id)

    // Get likes count
    const likesCount = await db
      .select({
        postId: likes.postId,
        count: sql<number>`count(*)`,
      })
      .from(likes)
      .where(inArray(likes.postId, postIds))
      .groupBy(likes.postId)

    // Get comments count
    const commentsCount = await db
      .select({
        postId: comments.postId,
        count: sql<number>`count(*)`,
      })
      .from(comments)
      .where(inArray(comments.postId, postIds))
      .groupBy(comments.postId)

    // Check if user has liked each post
    const userLikes = await db
      .select({ postId: likes.postId })
      .from(likes)
      .where(and(eq(likes.userId, userId), inArray(likes.postId, postIds)))

    const userLikedPosts = new Set(userLikes.map((like) => like.postId))

    // Create a map for easy lookup
    const likesMap = new Map(likesCount.map((item) => [item.postId, item.count]))
    const commentsMap = new Map(commentsCount.map((item) => [item.postId, item.count]))

    // Get total count for pagination
    const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(posts).where(whereClause)

    const totalCount = totalCountResult[0]?.count || 0

    // Format feed items
    const formattedItems: FeedItem[] = await Promise.all(
      feedItems.map(async (item) => {
        // Determine content type
        let contentType = ContentType.POST
        let title: string | undefined
        const tags: string[] = []

        // Extract title and tags from content
        const contentLines = item.content.split("\n")
        if (contentLines.length > 1) {
          title = contentLines[0]

          // Look for hashtags
          const hashtagRegex = /#(\w+)/g
          let match
          while ((match = hashtagRegex.exec(item.content)) !== null) {
            tags.push(match[1])
          }
        }

        // Determine content type based on content
        const contentLower = item.content.toLowerCase()
        if (
          contentLower.includes("article") ||
          contentLower.includes("blog") ||
          contentLower.includes("guide") ||
          contentLower.includes("how to")
        ) {
          contentType = ContentType.ARTICLE
        } else if (
          contentLower.includes("update") ||
          contentLower.includes("announcement") ||
          contentLower.includes("introducing")
        ) {
          contentType = ContentType.UPDATE
        } else if (
          contentLower.includes("event") ||
          contentLower.includes("webinar") ||
          contentLower.includes("conference") ||
          contentLower.includes("meetup")
        ) {
          contentType = ContentType.EVENT
        } else if (
          contentLower.includes("news") ||
          contentLower.includes("report") ||
          contentLower.includes("study") ||
          contentLower.includes("research")
        ) {
          contentType = ContentType.NEWS
        }

        // Calculate relevance score
        let relevanceScore = 0.5 // Base score

        // Connection posts are more relevant
        if (connectionIds.includes(item.authorId)) {
          relevanceScore += 0.2
        }

        // Industry match increases relevance
        if (userIndustry && contentLower.includes(userIndustry.toLowerCase())) {
          relevanceScore += 0.15
        }

        // Skills match increases relevance
        userSkills.forEach((skill) => {
          if (contentLower.includes(skill.toLowerCase())) {
            relevanceScore += 0.05
          }
        })

        // Recent posts are more relevant
        const postAge = Date.now() - new Date(item.createdAt).getTime()
        const daysSincePosted = postAge / (1000 * 60 * 60 * 24)
        if (daysSincePosted < 1) {
          relevanceScore += 0.1
        } else if (daysSincePosted < 3) {
          relevanceScore += 0.05
        }

        // High engagement increases relevance
        const likesCount = likesMap.get(item.id) || 0
        const commentsCount = commentsMap.get(item.id) || 0
        if (likesCount > 10 || commentsCount > 5) {
          relevanceScore += 0.1
        }

        // Cap relevance at 1.0
        relevanceScore = Math.min(relevanceScore, 1.0)

        return {
          id: item.id,
          type: contentType,
          content: item.content,
          title,
          authorId: item.authorId,
          authorName: item.authorName || "Unknown User",
          authorRole: item.authorRole || undefined,
          authorCompany: item.authorCompany || undefined,
          authorImage: item.authorImage || undefined,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt || undefined,
          media: item.media || [],
          likes: likesMap.get(item.id) || 0,
          comments: commentsMap.get(item.id) || 0,
          shares: 0, // We'll implement share count in a future update
          isLiked: userLikedPosts.has(item.id),
          isShared: false, // We'll implement share status in a future update
          relevanceScore,
          tags,
        }
      }),
    )

    // Track user activity
    await trackUserActivity(userId, "VIEW_FEED", {
      page,
      filterOptions,
      itemCount: formattedItems.length,
    })

    return {
      items: formattedItems,
      totalCount,
    }
  } catch (error) {
    console.error("Error fetching personalized feed:", error)
    throw new Error("Failed to fetch feed")
  }
}

/**
 * Get sort order based on relevance type
 */
function getSortOrder(relevance: RelevanceType = RelevanceType.RECENT) {
  switch (relevance) {
    case RelevanceType.POPULAR:
      // This is a simplified version - in a real app, you would have a more sophisticated popularity algorithm
      return [desc(sql`(select count(*) from likes where likes.post_id = posts.id)`)]
    case RelevanceType.RELEVANT:
      // This is a placeholder - in a real app, you would have a relevance score column or calculation
      return [desc(posts.createdAt)]
    case RelevanceType.RECENT:
    default:
      return [desc(posts.createdAt)]
  }
}

/**
 * Like a post
 */
export async function likePost(userId: string, postId: string): Promise<boolean> {
  try {
    // Check if user has already liked the post
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .limit(1)

    if (existingLike.length > 0) {
      // User has already liked the post, so unlike it
      await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)))

      // Track activity
      await trackUserActivity(userId, "UNLIKE_POST", { postId })

      return false
    } else {
      // User hasn't liked the post, so like it
      await db.insert(likes).values({
        userId,
        postId,
        createdAt: new Date(),
      })

      // Track activity
      await trackUserActivity(userId, "LIKE_POST", { postId })

      return true
    }
  } catch (error) {
    console.error("Error liking post:", error)
    throw new Error("Failed to like post")
  }
}

/**
 * Add a comment to a post
 */
export async function addComment(userId: string, postId: string, content: string): Promise<string> {
  try {
    // Moderate the comment content
    try {
      const moderationResult = await autoModerateContent(content)

      if (moderationResult.status === "FLAGGED") {
        throw new Error("Comment contains inappropriate content")
      }
    } catch (error) {
      // If moderation fails, we'll still allow the comment but log the error
      console.error("Comment moderation failed:", error)
    }

    // Add the comment
    const result = await db
      .insert(comments)
      .values({
        userId,
        postId,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: comments.id })

    // Track activity
    await trackUserActivity(userId, "COMMENT_POST", { postId, commentId: result[0].id })

    return result[0].id
  } catch (error) {
    console.error("Error adding comment:", error)
    throw new Error("Failed to add comment")
  }
}

/**
 * Share a post
 */
export async function sharePost(userId: string, postId: string, additionalContent?: string): Promise<string> {
  try {
    // Get the original post
    const originalPost = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)

    if (originalPost.length === 0) {
      throw new Error("Post not found")
    }

    // Create a new post that shares the original
    const sharedContent = additionalContent ? additionalContent : `Shared a post from ${originalPost[0].userId}`

    const result = await db
      .insert(posts)
      .values({
        userId,
        content: sharedContent,
        media: originalPost[0].media,
        visibility: "PUBLIC",
        isPromoted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sharedPostId: postId,
      })
      .returning({ id: posts.id })

    // Track activity
    await trackUserActivity(userId, "SHARE_POST", {
      originalPostId: postId,
      sharedPostId: result[0].id,
    })

    return result[0].id
  } catch (error) {
    console.error("Error sharing post:", error)
    throw new Error("Failed to share post")
  }
}

/**
 * Create a new post
 */
export async function createPost(
  userId: string,
  content: string,
  media?: string[],
  visibility: "PUBLIC" | "CONNECTIONS" | "PRIVATE" = "PUBLIC",
): Promise<string> {
  try {
    // Moderate the post content
    try {
      const moderationResult = await autoModerateContent(content)

      if (moderationResult.status === "FLAGGED") {
        throw new Error("Post contains inappropriate content: " + moderationResult.reason)
      }
    } catch (error) {
      // If moderation fails, we'll still allow the post but log the error
      console.error("Post moderation failed:", error)
    }

    // Create the post
    const result = await db
      .insert(posts)
      .values({
        userId,
        content,
        media: media || [],
        visibility,
        isPromoted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: posts.id })

    // Track activity
    await trackUserActivity(userId, "CREATE_POST", {
      postId: result[0].id,
      contentLength: content.length,
      mediaCount: media?.length || 0,
      visibility,
    })

    return result[0].id
  } catch (error) {
    console.error("Error creating post:", error)
    throw new Error("Failed to create post")
  }
}

/**
 * Get trending topics based on recent activity
 */
export async function getTrendingTopics(): Promise<{ topic: string; count: number }[]> {
  try {
    // In a real implementation, this would analyze post content, hashtags, etc.
    // For now, return placeholder data
    return [
      { topic: "Digital Transformation", count: 128 },
      { topic: "Remote Work", count: 96 },
      { topic: "AI in Business", count: 84 },
      { topic: "Sustainability", count: 72 },
      { topic: "Supply Chain Innovation", count: 65 },
    ]
  } catch (error) {
    console.error("Error fetching trending topics:", error)
    return []
  }
}

/**
 * Get recommended content based on user profile and activity
 */
export async function getRecommendedContent(userId: string): Promise<FeedItem[]> {
  try {
    // Get user's profile to understand their interests
    const userProfile = await db
      .select({
        professionalIndustry: professionalProfiles.industry,
        professionalSkills: professionalProfiles.skills,
        businessIndustry: businessProfiles.industry,
      })
      .from(users)
      .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .where(eq(users.id, userId))
      .limit(1)

    const userIndustry = userProfile[0]?.professionalIndustry || userProfile[0]?.businessIndustry

    // Get user's connections
    const userConnections = await db
      .select({ connectionId: connections.receiverId })
      .from(connections)
      .where(and(eq(connections.senderId, userId), eq(connections.status, "ACCEPTED")))
      .union(
        db
          .select({ connectionId: connections.senderId })
          .from(connections)
          .where(and(eq(connections.receiverId, userId), eq(connections.status, "ACCEPTED"))),
      )

    const connectionIds = userConnections.map((c) => c.connectionId)

    // Find popular posts in user's industry
    const industryPosts = await db
      .select({
        id: posts.id,
        content: posts.content,
        authorId: posts.userId,
        authorName: users.name,
        authorRole: professionalProfiles.title,
        authorCompany: businessProfiles.companyName,
        authorImage: users.image,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        media: posts.media,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .where(
        and(
          eq(posts.visibility, "PUBLIC"),
          not(eq(posts.userId, userId)),
          not(inArray(posts.userId, connectionIds)),
          userIndustry ? sql`${posts.content} ILIKE ${`%${userIndustry}%`}` : sql`1=1`,
        ),
      )
      .orderBy(desc(posts.createdAt))
      .limit(5)

    // Format as feed items
    const recommendedItems: FeedItem[] = industryPosts.map((post) => {
      // Determine content type
      const contentType = ContentType.POST
      let title: string | undefined
      const tags: string[] = []

      // Extract title and tags from content
      const contentLines = post.content.split("\n")
      if (contentLines.length > 1) {
        title = contentLines[0]

        // Look for hashtags
        const hashtagRegex = /#(\w+)/g
        let match
        while ((match = hashtagRegex.exec(post.content)) !== null) {
          tags.push(match[1])
        }
      }

      return {
        id: post.id,
        type: contentType,
        content: post.content,
        title,
        authorId: post.authorId,
        authorName: post.authorName || "Unknown User",
        authorRole: post.authorRole || undefined,
        authorCompany: post.authorCompany || undefined,
        authorImage: post.authorImage || undefined,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt || undefined,
        media: post.media || [],
        likes: 0, // We'll get these in a separate query in a real implementation
        comments: 0,
        shares: 0,
        isLiked: false,
        isShared: false,
        relevanceScore: 0.8, // Placeholder score
        tags,
      }
    })

    // Track activity
    await trackUserActivity(userId, "VIEW_RECOMMENDATIONS", {
      count: recommendedItems.length,
      industry: userIndustry,
    })

    return recommendedItems
  } catch (error) {
    console.error("Error fetching recommended content:", error)
    return []
  }
}

