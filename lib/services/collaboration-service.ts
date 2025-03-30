import { db } from "@/lib/db"
import {
  users,
  connections,
  messages,
  groups,
  groupMembers,
  professionalProfiles,
  businessProfiles,
} from "@/lib/db/schema"
import { eq, and, or, not, inArray, desc, count, sql } from "drizzle-orm"

export interface ConnectionSuggestion {
  userId: string
  name: string
  role?: string
  company?: string
  profileImage?: string
  mutualConnections: number
  industry?: string
  relevanceScore: number
  connectionReason: string
}

export interface CollaborationGroup {
  id: string
  name: string
  description?: string
  image?: string
  memberCount: number
  isPrivate: boolean
  industry?: string
  tags: string[]
  recentActivity: boolean
}

/**
 * Get personalized connection suggestions
 */
export async function getConnectionSuggestions(userId: string, limit = 5): Promise<ConnectionSuggestion[]> {
  try {
    // Get user's existing connections
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

    // Get user's profile
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

    const userIndustry = userProfile[0]?.professionalIndustry || userProfile[0]?.businessIndustry

    // Find second-degree connections (connections of connections)
    const secondDegreeConnections = await db
      .select({
        userId: connections.receiverId,
        connectionId: connections.senderId,
      })
      .from(connections)
      .where(
        and(
          inArray(connections.senderId, connectionIds),
          not(eq(connections.receiverId, userId)),
          not(inArray(connections.receiverId, connectionIds)),
          eq(connections.status, "ACCEPTED"),
        ),
      )
      .union(
        db
          .select({
            userId: connections.senderId,
            connectionId: connections.receiverId,
          })
          .from(connections)
          .where(
            and(
              inArray(connections.receiverId, connectionIds),
              not(eq(connections.senderId, userId)),
              not(inArray(connections.senderId, connectionIds)),
              eq(connections.status, "ACCEPTED"),
            ),
          ),
      )

    // Count mutual connections
    const mutualConnectionCounts = new Map<string, number>()
    secondDegreeConnections.forEach((conn) => {
      const count = mutualConnectionCounts.get(conn.userId) || 0
      mutualConnectionCounts.set(conn.userId, count + 1)
    })

    // Get user details for suggestions
    const suggestionUserIds = [...mutualConnectionCounts.keys()]

    if (suggestionUserIds.length === 0) {
      return []
    }

    const suggestionUsers = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        professionalTitle: professionalProfiles.title,
        professionalIndustry: professionalProfiles.industry,
        professionalSkills: professionalProfiles.skills,
        businessName: businessProfiles.companyName,
        businessIndustry: businessProfiles.industry,
      })
      .from(users)
      .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .where(inArray(users.id, suggestionUserIds))

    // Format and score suggestions
    const suggestions: ConnectionSuggestion[] = suggestionUsers.map((user) => {
      const mutualCount = mutualConnectionCounts.get(user.id) || 0
      const userIndustryMatch = (user.professionalIndustry || user.businessIndustry) === userIndustry

      // Calculate relevance score
      let relevanceScore = 0.3 // Base score
      relevanceScore += Math.min(mutualCount * 0.1, 0.3) // Up to 0.3 for mutual connections
      if (userIndustryMatch) relevanceScore += 0.2 // Industry match

      // Determine connection reason
      let connectionReason = `${mutualCount} mutual connection${mutualCount !== 1 ? "s" : ""}`
      if (userIndustryMatch) {
        connectionReason += ` and same industry (${userIndustry})`
      }

      return {
        userId: user.id,
        name: user.name,
        role: user.professionalTitle,
        company: user.businessName,
        profileImage: user.image,
        mutualConnections: mutualCount,
        industry: user.professionalIndustry || user.businessIndustry,
        relevanceScore,
        connectionReason,
      }
    })

    // Sort by relevance and return top suggestions
    return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit)
  } catch (error) {
    console.error("Error fetching connection suggestions:", error)
    return []
  }
}

/**
 * Get recommended collaboration groups
 */
export async function getRecommendedGroups(userId: string, limit = 3): Promise<CollaborationGroup[]> {
  try {
    // Get user's profile and existing group memberships
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

    // Get user's existing group memberships
    const userGroups = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId))

    const userGroupIds = userGroups.map((g) => g.groupId)

    // Find groups that match user's industry but user is not a member of
    const recommendedGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        image: groups.image,
        isPrivate: groups.isPrivate,
        memberCount: count(groupMembers.id),
        createdAt: groups.createdAt,
        updatedAt: groups.updatedAt,
      })
      .from(groups)
      .leftJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(
        and(
          not(inArray(groups.id, userGroupIds)),
          or(sql`${groups.name} ILIKE ${`%${userIndustry}%`}`, sql`${groups.description} ILIKE ${`%${userIndustry}%`}`),
        ),
      )
      .groupBy(groups.id)
      .orderBy(desc(count(groupMembers.id)))
      .limit(limit)

    // Format as collaboration groups
    return recommendedGroups.map((group) => {
      // Extract tags from group name and description
      const tags = extractTagsFromGroupInfo(group.name, group.description || "")

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        image: group.image,
        memberCount: group.memberCount,
        isPrivate: group.isPrivate,
        industry: userIndustry, // Assuming the group is related to user's industry
        tags,
        recentActivity: group.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Activity in last 7 days
      }
    })
  } catch (error) {
    console.error("Error fetching recommended groups:", error)
    return []
  }
}

/**
 * Extract tags from group information
 */
function extractTagsFromGroupInfo(name: string, description: string): string[] {
  const combinedText = `${name} ${description}`.toLowerCase()
  const tags: string[] = []

  // Industry terms
  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Marketing",
    "Sales",
    "Manufacturing",
    "Retail",
    "Education",
    "Consulting",
    "Legal",
  ]

  industries.forEach((industry) => {
    if (combinedText.includes(industry.toLowerCase())) {
      tags.push(industry)
    }
  })

  // Topic terms
  const topics = [
    "Leadership",
    "Innovation",
    "Strategy",
    "Digital Transformation",
    "Networking",
    "Professional Development",
    "Mentorship",
    "Collaboration",
  ]

  topics.forEach((topic) => {
    if (combinedText.includes(topic.toLowerCase())) {
      tags.push(topic)
    }
  })

  // If no tags found, add a default
  if (tags.length === 0) {
    tags.push("Professional Group")
  }

  return [...new Set(tags)] // Remove duplicates
}

/**
 * Send connection request
 */
export async function sendConnectionRequest(senderId: string, receiverId: string, message?: string): Promise<boolean> {
  try {
    // Check if connection already exists
    const existingConnection = await db
      .select()
      .from(connections)
      .where(
        or(
          and(eq(connections.senderId, senderId), eq(connections.receiverId, receiverId)),
          and(eq(connections.senderId, receiverId), eq(connections.receiverId, senderId)),
        ),
      )
      .limit(1)

    if (existingConnection.length > 0) {
      return false // Connection already exists
    }

    // Create connection request
    await db.insert(connections).values({
      senderId,
      receiverId,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // If message provided, send it
    if (message) {
      await db.insert(messages).values({
        senderId,
        receiverId,
        content: message,
        isRead: false,
        createdAt: new Date(),
      })
    }

    return true
  } catch (error) {
    console.error("Error sending connection request:", error)
    throw new Error("Failed to send connection request")
  }
}

/**
 * Join collaboration group
 */
export async function joinCollaborationGroup(userId: string, groupId: string): Promise<boolean> {
  try {
    // Check if user is already a member
    const existingMembership = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)))
      .limit(1)

    if (existingMembership.length > 0) {
      return false // Already a member
    }

    // Add user to group
    await db.insert(groupMembers).values({
      userId,
      groupId,
      role: "MEMBER",
      joinedAt: new Date(),
    })

    return true
  } catch (error) {
    console.error("Error joining collaboration group:", error)
    throw new Error("Failed to join group")
  }
}

