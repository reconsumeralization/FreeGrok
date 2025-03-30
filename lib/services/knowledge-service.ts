import { db } from "@/lib/db"
import { posts, users, businessProfiles, professionalProfiles, likes, comments } from "@/lib/db/schema"
import { eq, and, or, desc, sql, count } from "drizzle-orm"

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  authorRole?: string
  authorCompany?: string
  authorImage?: string
  createdAt: Date
  updatedAt?: Date
  likes: number
  comments: number
  views: number
  tags: string[]
  category: string
  readTime: number
  isFeatured: boolean
}

export interface ResourceLibraryItem {
  id: string
  type: "article" | "whitepaper" | "case-study" | "ebook" | "webinar" | "template"
  title: string
  description: string
  authorId: string
  authorName: string
  authorCompany?: string
  thumbnailUrl?: string
  fileUrl?: string
  createdAt: Date
  downloads: number
  likes: number
  category: string
  tags: string[]
  isFeatured: boolean
  isPremium: boolean
}

/**
 * Get trending knowledge articles
 */
export async function getTrendingArticles(limit = 5, category?: string): Promise<KnowledgeArticle[]> {
  try {
    // Get posts with high engagement that are knowledge-focused
    const articlesQuery = db
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
        likesCount: count(likes.id),
        commentsCount: count(comments.id),
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .where(
        and(
          eq(posts.visibility, "PUBLIC"),
          or(
            sql`${posts.content} ILIKE '%how to%'`,
            sql`${posts.content} ILIKE '%guide%'`,
            sql`${posts.content} ILIKE '%tips%'`,
            sql`${posts.content} ILIKE '%best practices%'`,
            sql`${posts.content} ILIKE '%insights%'`,
            sql`${posts.content} ILIKE '%trends%'`,
          ),
        ),
      )
      .groupBy(
        posts.id,
        posts.content,
        posts.userId,
        users.name,
        professionalProfiles.title,
        businessProfiles.companyName,
        users.image,
        posts.createdAt,
        posts.updatedAt,
      )
      .orderBy(desc(sql`COUNT(${likes.id}) + COUNT(${comments.id}) * 2`))
      .limit(limit)

    // Apply category filter if provided
    if (category) {
      articlesQuery.where(sql`${posts.content} ILIKE ${`%${category}%`}`)
    }

    const articles = await articlesQuery

    // Format as knowledge articles
    return articles.map((article) => {
      // Extract title from content (first sentence or first 60 chars)
      const contentLines = article.content.split("\n")
      const firstLine = contentLines[0]
      const title = firstLine.length > 60 ? firstLine.substring(0, 57) + "..." : firstLine

      // Extract tags from content
      const tags = extractTagsFromContent(article.content)

      // Determine category
      const category = determineCategory(article.content, tags)

      // Calculate read time (approx. 200 words per minute)
      const wordCount = article.content.split(/\s+/).length
      const readTime = Math.max(1, Math.round(wordCount / 200))

      return {
        id: article.id,
        title,
        content: article.content,
        authorId: article.authorId,
        authorName: article.authorName,
        authorRole: article.authorRole,
        authorCompany: article.authorCompany,
        authorImage: article.authorImage,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        likes: article.likesCount,
        comments: article.commentsCount,
        views: Math.floor(article.likesCount * 5 + article.commentsCount * 10), // Estimated views
        tags,
        category,
        readTime,
        isFeatured: article.likesCount > 10 || article.commentsCount > 5,
      }
    })
  } catch (error) {
    console.error("Error fetching trending articles:", error)
    return []
  }
}

/**
 * Get resource library items
 */
export async function getResourceLibrary(limit = 10, category?: string, type?: string): Promise<ResourceLibraryItem[]> {
  try {
    // In a real implementation, this would query a dedicated resources table
    // For now, return placeholder data
    const resources: ResourceLibraryItem[] = [
      {
        id: "1",
        type: "whitepaper",
        title: "The Future of B2B Marketing in 2025",
        description: "An in-depth analysis of emerging trends and technologies shaping B2B marketing strategies.",
        authorId: "user1",
        authorName: "Marketing Insights Team",
        authorCompany: "Global Marketing Partners",
        thumbnailUrl: "/placeholder.svg?height=200&width=300",
        fileUrl: "/resources/whitepaper-b2b-marketing-2025.pdf",
        createdAt: new Date("2023-11-15"),
        downloads: 1248,
        likes: 342,
        category: "Marketing",
        tags: ["B2B Marketing", "Trends", "Strategy"],
        isFeatured: true,
        isPremium: false,
      },
      {
        id: "2",
        type: "case-study",
        title: "How TechSolutions Increased Conversion Rates by 45%",
        description: "A detailed case study on implementing data-driven sales strategies.",
        authorId: "user2",
        authorName: "Sales Excellence Department",
        authorCompany: "TechSolutions Inc.",
        thumbnailUrl: "/placeholder.svg?height=200&width=300",
        fileUrl: "/resources/case-study-techsolutions.pdf",
        createdAt: new Date("2023-10-22"),
        downloads: 876,
        likes: 215,
        category: "Sales",
        tags: ["Case Study", "Conversion Optimization", "B2B Sales"],
        isFeatured: false,
        isPremium: false,
      },
      {
        id: "3",
        type: "template",
        title: "B2B Content Marketing Strategy Template",
        description: "A comprehensive template to develop and execute effective B2B content marketing strategies.",
        authorId: "user3",
        authorName: "Content Strategy Team",
        authorCompany: "Content Masters",
        thumbnailUrl: "/placeholder.svg?height=200&width=300",
        fileUrl: "/resources/template-content-marketing.xlsx",
        createdAt: new Date("2023-09-18"),
        downloads: 2134,
        likes: 567,
        category: "Content Marketing",
        tags: ["Template", "Content Strategy", "Planning"],
        isFeatured: true,
        isPremium: true,
      },
    ]

    // Filter by category if provided
    let filteredResources = resources
    if (category) {
      filteredResources = filteredResources.filter(
        (resource) =>
          resource.category.toLowerCase() === category.toLowerCase() ||
          resource.tags.some((tag) => tag.toLowerCase().includes(category.toLowerCase())),
      )
    }

    // Filter by type if provided
    if (type) {
      filteredResources = filteredResources.filter((resource) => resource.type === type)
    }

    return filteredResources.slice(0, limit)
  } catch (error) {
    console.error("Error fetching resource library:", error)
    return []
  }
}

/**
 * Extract tags from content
 */
function extractTagsFromContent(content: string): string[] {
  const tags: string[] = []

  // Look for hashtags
  const hashtagRegex = /#(\w+)/g
  let match
  while ((match = hashtagRegex.exec(content)) !== null) {
    tags.push(match[1])
  }

  // Look for common industry terms
  const industryTerms = [
    "Marketing",
    "Sales",
    "Technology",
    "Finance",
    "HR",
    "Operations",
    "Strategy",
    "Leadership",
    "Innovation",
    "Digital Transformation",
    "AI",
    "Machine Learning",
    "Blockchain",
    "Cloud Computing",
    "Remote Work",
    "Sustainability",
    "Supply Chain",
  ]

  industryTerms.forEach((term) => {
    if (content.toLowerCase().includes(term.toLowerCase())) {
      tags.push(term)
    }
  })

  return [...new Set(tags)] // Remove duplicates
}

/**
 * Determine content category
 */
function determineCategory(content: string, tags: string[]): string {
  // Map of keywords to categories
  const categoryKeywords: Record<string, string[]> = {
    Marketing: ["marketing", "brand", "campaign", "audience", "content marketing"],
    Sales: ["sales", "leads", "pipeline", "conversion", "revenue"],
    Technology: ["technology", "software", "hardware", "IT", "tech", "digital"],
    Finance: ["finance", "investment", "funding", "capital", "financial"],
    Leadership: ["leadership", "management", "executive", "strategy", "vision"],
    Operations: ["operations", "process", "efficiency", "workflow", "optimization"],
    HR: ["HR", "human resources", "talent", "recruitment", "hiring", "employees"],
    Innovation: ["innovation", "disruption", "creative", "breakthrough", "R&D"],
  }

  // Check tags first
  for (const tag of tags) {
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => tag.toLowerCase().includes(keyword))) {
        return category
      }
    }
  }

  // Check content
  const contentLower = content.toLowerCase()
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => contentLower.includes(keyword))) {
      return category
    }
  }

  // Default category
  return "General"
}

/**
 * Submit a knowledge article
 */
export async function submitKnowledgeArticle(
  userId: string,
  title: string,
  content: string,
  tags: string[] = [],
): Promise<string> {
  try {
    // In a real implementation, this would create a specialized knowledge article
    // For now, create a regular post with the content
    const result = await db
      .insert(posts)
      .values({
        userId,
        content: `${title}\n\n${content}\n\n${tags.map((tag) => `#${tag}`).join(" ")}`,
        visibility: "PUBLIC",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: posts.id })

    return result[0].id
  } catch (error) {
    console.error("Error submitting knowledge article:", error)
    throw new Error("Failed to submit article")
  }
}

