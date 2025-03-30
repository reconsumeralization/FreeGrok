import { db } from "@/lib/db"
import { users, businessProfiles, professionalProfiles, connections, posts } from "@/lib/db/schema"
import { eq, and, or, not, inArray, desc, sql } from "drizzle-orm"

export interface BusinessOpportunity {
  id: string
  type: "connection" | "collaboration" | "partnership" | "project" | "job" | "event"
  title: string
  description: string
  companyId?: string
  companyName?: string
  companyLogo?: string
  location?: string
  industry?: string
  relevanceScore: number
  deadline?: Date
  url?: string
  contactPersonId?: string
  contactPersonName?: string
  createdAt: Date
  tags: string[]
}

/**
 * Get personalized business opportunities for a user
 */
export async function getPersonalizedOpportunities(userId: string, limit = 5): Promise<BusinessOpportunity[]> {
  try {
    // Get user's profile to understand their interests and industry
    const userProfile = await db
      .select({
        professionalTitle: professionalProfiles.title,
        professionalIndustry: professionalProfiles.industry,
        professionalSkills: professionalProfiles.skills,
        businessName: businessProfiles.companyName,
        businessIndustry: businessProfiles.industry,
      })
      .from(users)
      .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .where(eq(users.id, userId))
      .limit(1)

    if (!userProfile[0]) {
      return []
    }

    const userIndustry = userProfile[0].professionalIndustry || userProfile[0].businessIndustry
    const userSkills = userProfile[0].professionalSkills || []

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

    // Find potential business partners based on industry and complementary skills
    const potentialPartners = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        companyName: businessProfiles.companyName,
        companyLogo: businessProfiles.logo,
        industry: businessProfiles.industry || professionalProfiles.industry,
        skills: professionalProfiles.skills,
      })
      .from(users)
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
      .where(
        and(
          not(eq(users.id, userId)),
          not(inArray(users.id, connectionIds)),
          or(eq(businessProfiles.industry, userIndustry), eq(professionalProfiles.industry, userIndustry)),
        ),
      )
      .limit(20)

    // Find collaboration opportunities from posts
    const collaborationPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        createdAt: posts.createdAt,
        userName: users.name,
        userImage: users.image,
        companyName: businessProfiles.companyName,
        companyLogo: businessProfiles.logo,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .where(
        and(
          eq(posts.visibility, "PUBLIC"),
          not(eq(posts.userId, userId)),
          sql`${posts.content} ILIKE '%collaboration%' OR ${posts.content} ILIKE '%partner%' OR ${posts.content} ILIKE '%opportunity%'`,
        ),
      )
      .orderBy(desc(posts.createdAt))
      .limit(10)

    // Calculate relevance scores and format opportunities
    const opportunities: BusinessOpportunity[] = []

    // Add connection opportunities
    potentialPartners.forEach((partner) => {
      // Calculate relevance score based on industry match and skill complementarity
      let relevanceScore = 0.5 // Base score

      // Industry match increases relevance
      if (partner.industry === userIndustry) {
        relevanceScore += 0.2
      }

      // Skill complementarity increases relevance
      const partnerSkills = partner.skills || []
      const complementarySkills = partnerSkills.filter((skill) => !userSkills.includes(skill))
      if (complementarySkills.length > 0) {
        relevanceScore += 0.1 * Math.min(complementarySkills.length / 3, 0.3) // Up to 0.3 for skills
      }

      opportunities.push({
        id: `connection-${partner.id}`,
        type: "connection",
        title: `Connect with ${partner.name}`,
        description: `${partner.name} works in the ${partner.industry} industry${partner.companyName ? ` at ${partner.companyName}` : ""} and has complementary skills that could benefit your network.`,
        companyId: partner.companyName ? partner.id : undefined,
        companyName: partner.companyName,
        companyLogo: partner.companyLogo,
        industry: partner.industry,
        relevanceScore,
        contactPersonId: partner.id,
        contactPersonName: partner.name,
        createdAt: new Date(),
        tags: ["connection", partner.industry || ""],
      })
    })

    // Add collaboration opportunities
    collaborationPosts.forEach((post) => {
      // Extract keywords from post content to determine type and relevance
      const content = post.content.toLowerCase()
      let type: "collaboration" | "partnership" | "project" | "job" = "collaboration"
      let relevanceScore = 0.4 // Base score
      const tags = ["opportunity"]

      if (content.includes("partner") || content.includes("partnership")) {
        type = "partnership"
        relevanceScore += 0.1
        tags.push("partnership")
      } else if (content.includes("project")) {
        type = "project"
        relevanceScore += 0.1
        tags.push("project")
      } else if (content.includes("job") || content.includes("position") || content.includes("hiring")) {
        type = "job"
        relevanceScore += 0.1
        tags.push("job")
      }

      // Industry-specific keywords increase relevance
      if (userIndustry && content.includes(userIndustry.toLowerCase())) {
        relevanceScore += 0.2
        tags.push(userIndustry)
      }

      // Skills mentioned increase relevance
      userSkills.forEach((skill) => {
        if (content.includes(skill.toLowerCase())) {
          relevanceScore += 0.05
          tags.push(skill)
        }
      })

      // Cap relevance at 1.0
      relevanceScore = Math.min(relevanceScore, 1.0)

      opportunities.push({
        id: `post-${post.id}`,
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Opportunity`,
        description: post.content.length > 200 ? post.content.substring(0, 197) + "..." : post.content,
        companyName: post.companyName,
        companyLogo: post.companyLogo,
        relevanceScore,
        contactPersonId: post.userId,
        contactPersonName: post.userName,
        createdAt: post.createdAt,
        tags: [...new Set(tags)], // Remove duplicates
      })
    })

    // Sort by relevance and return top opportunities
    return opportunities.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit)
  } catch (error) {
    console.error("Error fetching personalized opportunities:", error)
    return []
  }
}

/**
 * Get industry-specific opportunities
 */
export async function getIndustryOpportunities(industry: string, limit = 10): Promise<BusinessOpportunity[]> {
  try {
    // Implementation would be similar to getPersonalizedOpportunities
    // but focused on a specific industry rather than user profile

    // For now, return a placeholder implementation
    return [
      {
        id: `industry-${Date.now()}`,
        type: "partnership",
        title: `${industry} Industry Partnership`,
        description: `Opportunity for collaboration in the ${industry} sector with leading companies.`,
        industry,
        relevanceScore: 0.8,
        createdAt: new Date(),
        tags: ["industry", industry, "partnership"],
      },
    ]
  } catch (error) {
    console.error(`Error fetching ${industry} opportunities:`, error)
    return []
  }
}

/**
 * Track opportunity engagement
 */
export async function trackOpportunityEngagement(
  userId: string,
  opportunityId: string,
  action: "view" | "click" | "save" | "apply" | "dismiss",
): Promise<void> {
  try {
    // In a real implementation, this would store the engagement in the database
    // to improve future recommendations
    console.log(`User ${userId} ${action}ed opportunity ${opportunityId}`)
  } catch (error) {
    console.error("Error tracking opportunity engagement:", error)
  }
}

