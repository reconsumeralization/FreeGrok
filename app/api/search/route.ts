import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import {
  users,
  businessProfiles,
  professionalProfiles,
  posts,
  groups,
  events,
  likes,
  comments,
  eventAttendees,
  groupMembers,
} from "@/lib/db/schema"
import { eq, and, or, like, gte, count, sql } from "drizzle-orm"

export async function GET(req) {
  try {
    const user = await getCurrentUser()

    // Get search parameters
    const { searchParams } = new URL(req.url)

    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Validate query
    if (!query) {
      return NextResponse.json({
        results: [],
        total: 0,
        page,
        limit,
      })
    }

    let results = []
    let total = 0

    // Search based on type
    switch (type) {
      case "businesses":
        const businessResults = await db
          .select({
            id: businessProfiles.id,
            userId: businessProfiles.userId,
            name: businessProfiles.companyName,
            logo: businessProfiles.logo,
            industry: businessProfiles.industry,
            location: businessProfiles.location,
            description: businessProfiles.description,
            userImage: users.image,
          })
          .from(businessProfiles)
          .leftJoin(users, eq(businessProfiles.userId, users.id))
          .where(
            or(
              like(businessProfiles.companyName, `%${query}%`),
              like(businessProfiles.industry, `%${query}%`),
              like(businessProfiles.description, `%${query}%`),
              like(businessProfiles.location, `%${query}%`),
            ),
          )
          .limit(limit)
          .offset(skip)

        const businessCount = await db
          .select({ count: count() })
          .from(businessProfiles)
          .where(
            or(
              like(businessProfiles.companyName, `%${query}%`),
              like(businessProfiles.industry, `%${query}%`),
              like(businessProfiles.description, `%${query}%`),
              like(businessProfiles.location, `%${query}%`),
            ),
          )

        total = businessCount[0]?.count || 0

        results = businessResults.map((profile) => ({
          id: profile.id,
          userId: profile.userId,
          name: profile.name,
          image: profile.logo || profile.userImage,
          type: "business",
          industry: profile.industry,
          location: profile.location,
          description: profile.description,
        }))
        break

      case "professionals":
        const professionalResults = await db
          .select({
            id: professionalProfiles.id,
            userId: professionalProfiles.userId,
            name: professionalProfiles.fullName,
            title: professionalProfiles.title,
            company: professionalProfiles.company,
            industry: professionalProfiles.industry,
            location: professionalProfiles.location,
            description: professionalProfiles.bio,
            userImage: users.image,
          })
          .from(professionalProfiles)
          .leftJoin(users, eq(professionalProfiles.userId, users.id))
          .where(
            or(
              like(professionalProfiles.fullName, `%${query}%`),
              like(professionalProfiles.title, `%${query}%`),
              like(professionalProfiles.company, `%${query}%`),
              like(professionalProfiles.industry, `%${query}%`),
              like(professionalProfiles.bio, `%${query}%`),
              like(professionalProfiles.location, `%${query}%`),
            ),
          )
          .limit(limit)
          .offset(skip)

        const professionalCount = await db
          .select({ count: count() })
          .from(professionalProfiles)
          .where(
            or(
              like(professionalProfiles.fullName, `%${query}%`),
              like(professionalProfiles.title, `%${query}%`),
              like(professionalProfiles.company, `%${query}%`),
              like(professionalProfiles.industry, `%${query}%`),
              like(professionalProfiles.bio, `%${query}%`),
              like(professionalProfiles.location, `%${query}%`),
            ),
          )

        total = professionalCount[0]?.count || 0

        results = professionalResults.map((profile) => ({
          id: profile.id,
          userId: profile.userId,
          name: profile.name,
          image: profile.userImage,
          type: "professional",
          title: profile.title,
          company: profile.company,
          industry: profile.industry,
          location: profile.location,
          description: profile.description,
        }))
        break

      case "posts":
        // First get the posts
        const postResults = await db
          .select({
            id: posts.id,
            userId: posts.userId,
            content: posts.content,
            media: posts.media,
            createdAt: posts.createdAt,
            userName: users.name,
            userImage: users.image,
            businessName: businessProfiles.companyName,
            professionalName: professionalProfiles.fullName,
          })
          .from(posts)
          .leftJoin(users, eq(posts.userId, users.id))
          .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
          .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
          .where(and(like(posts.content, `%${query}%`), eq(posts.visibility, "PUBLIC")))
          .orderBy(sql`${posts.createdAt} DESC`)
          .limit(limit)
          .offset(skip)

        // Get counts for each post
        const postIds = postResults.map((post) => post.id)

        // Get likes count
        const likesCount = await db
          .select({
            postId: likes.postId,
            count: count(),
          })
          .from(likes)
          .where(sql`${likes.postId} IN ${postIds}`)
          .groupBy(likes.postId)

        // Get comments count
        const commentsCount = await db
          .select({
            postId: comments.postId,
            count: count(),
          })
          .from(comments)
          .where(sql`${comments.postId} IN ${postIds}`)
          .groupBy(comments.postId)

        // Create a map for easy lookup
        const likesMap = Object.fromEntries(likesCount.map((item) => [item.postId, item.count]))

        const commentsMap = Object.fromEntries(commentsCount.map((item) => [item.postId, item.count]))

        const postCount = await db
          .select({ count: count() })
          .from(posts)
          .where(and(like(posts.content, `%${query}%`), eq(posts.visibility, "PUBLIC")))

        total = postCount[0]?.count || 0

        results = postResults.map((post) => ({
          id: post.id,
          userId: post.userId,
          name: post.businessName || post.professionalName || post.userName,
          image: post.userImage,
          type: "post",
          content: post.content,
          media: post.media,
          createdAt: post.createdAt,
          likes: likesMap[post.id] || 0,
          comments: commentsMap[post.id] || 0,
        }))
        break

      case "groups":
        const groupResults = await db
          .select({
            id: groups.id,
            name: groups.name,
            image: groups.image,
            description: groups.description,
          })
          .from(groups)
          .where(
            and(
              or(like(groups.name, `%${query}%`), like(groups.description, `%${query}%`)),
              eq(groups.isPrivate, false),
            ),
          )
          .limit(limit)
          .offset(skip)

        // Get member counts
        const groupIds = groupResults.map((group) => group.id)

        const memberCounts = await db
          .select({
            groupId: groupMembers.groupId,
            count: count(),
          })
          .from(groupMembers)
          .where(sql`${groupMembers.groupId} IN ${groupIds}`)
          .groupBy(groupMembers.groupId)

        // Get post counts
        const postCounts = await db
          .select({
            groupId: posts.groupId,
            count: count(),
          })
          .from(posts)
          .where(sql`${posts.groupId} IN ${groupIds}`)
          .groupBy(posts.groupId)

        // Create maps for easy lookup
        const memberMap = Object.fromEntries(memberCounts.map((item) => [item.groupId, item.count]))

        const postMap = Object.fromEntries(postCounts.map((item) => [item.groupId, item.count]))

        const groupCount = await db
          .select({ count: count() })
          .from(groups)
          .where(
            and(
              or(like(groups.name, `%${query}%`), like(groups.description, `%${query}%`)),
              eq(groups.isPrivate, false),
            ),
          )

        total = groupCount[0]?.count || 0

        results = groupResults.map((group) => ({
          id: group.id,
          name: group.name,
          image: group.image,
          type: "group",
          description: group.description,
          members: memberMap[group.id] || 0,
          posts: postMap[group.id] || 0,
        }))
        break

      case "events":
        const eventResults = await db
          .select({
            id: events.id,
            name: events.title,
            image: events.image,
            description: events.description,
            location: events.location,
            isOnline: events.isOnline,
            startDate: events.startDate,
            endDate: events.endDate,
          })
          .from(events)
          .where(
            and(
              or(
                like(events.title, `%${query}%`),
                like(events.description, `%${query}%`),
                like(events.location, `%${query}%`),
              ),
              eq(events.isPrivate, false),
              gte(events.startDate, new Date()),
            ),
          )
          .orderBy(sql`${events.startDate} ASC`)
          .limit(limit)
          .offset(skip)

        // Get attendee counts
        const eventIds = eventResults.map((event) => event.id)

        const attendeeCounts = await db
          .select({
            eventId: eventAttendees.eventId,
            count: count(),
          })
          .from(eventAttendees)
          .where(sql`${eventAttendees.eventId} IN ${eventIds}`)
          .groupBy(eventAttendees.eventId)

        // Create map for easy lookup
        const attendeeMap = Object.fromEntries(attendeeCounts.map((item) => [item.eventId, item.count]))

        const eventCount = await db
          .select({ count: count() })
          .from(events)
          .where(
            and(
              or(
                like(events.title, `%${query}%`),
                like(events.description, `%${query}%`),
                like(events.location, `%${query}%`),
              ),
              eq(events.isPrivate, false),
              gte(events.startDate, new Date()),
            ),
          )

        total = eventCount[0]?.count || 0

        results = eventResults.map((event) => ({
          id: event.id,
          name: event.name,
          image: event.image,
          type: "event",
          description: event.description,
          location: event.location,
          isOnline: event.isOnline,
          startDate: event.startDate,
          endDate: event.endDate,
          attendees: attendeeMap[event.id] || 0,
        }))
        break

      default:
        // Search all types with limited results for each
        // This is a more complex query that would combine results from multiple tables
        // For simplicity, we'll execute separate queries and combine the results

        // Get businesses (limited to 3)
        const businessItems = await db
          .select({
            id: businessProfiles.id,
            userId: businessProfiles.userId,
            name: businessProfiles.companyName,
            logo: businessProfiles.logo,
            industry: businessProfiles.industry,
            description: businessProfiles.description,
            userImage: users.image,
          })
          .from(businessProfiles)
          .leftJoin(users, eq(businessProfiles.userId, users.id))
          .where(
            or(
              like(businessProfiles.companyName, `%${query}%`),
              like(businessProfiles.industry, `%${query}%`),
              like(businessProfiles.description, `%${query}%`),
            ),
          )
          .limit(3)

        // Get professionals (limited to 3)
        const professionalItems = await db
          .select({
            id: professionalProfiles.id,
            userId: professionalProfiles.userId,
            name: professionalProfiles.fullName,
            title: professionalProfiles.title,
            company: professionalProfiles.company,
            description: professionalProfiles.bio,
            userImage: users.image,
          })
          .from(professionalProfiles)
          .leftJoin(users, eq(professionalProfiles.userId, users.id))
          .where(
            or(
              like(professionalProfiles.fullName, `%${query}%`),
              like(professionalProfiles.title, `%${query}%`),
              like(professionalProfiles.company, `%${query}%`),
            ),
          )
          .limit(3)

        // Get posts (limited to 3)
        const postItems = await db
          .select({
            id: posts.id,
            userId: posts.userId,
            content: posts.content,
            createdAt: posts.createdAt,
            userName: users.name,
            userImage: users.image,
            businessName: businessProfiles.companyName,
            professionalName: professionalProfiles.fullName,
          })
          .from(posts)
          .leftJoin(users, eq(posts.userId, users.id))
          .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
          .leftJoin(professionalProfiles, eq(users.id, professionalProfiles.userId))
          .where(and(like(posts.content, `%${query}%`), eq(posts.visibility, "PUBLIC")))
          .orderBy(sql`${posts.createdAt} DESC`)
          .limit(3)

        // Get groups (limited to 3)
        const groupItems = await db
          .select({
            id: groups.id,
            name: groups.name,
            image: groups.image,
            description: groups.description,
          })
          .from(groups)
          .where(
            and(
              or(like(groups.name, `%${query}%`), like(groups.description, `%${query}%`)),
              eq(groups.isPrivate, false),
            ),
          )
          .limit(3)

        // Get events (limited to 3)
        const eventItems = await db
          .select({
            id: events.id,
            name: events.title,
            image: events.image,
            description: events.description,
            startDate: events.startDate,
          })
          .from(events)
          .where(
            and(
              or(like(events.title, `%${query}%`), like(events.description, `%${query}%`)),
              eq(events.isPrivate, false),
              gte(events.startDate, new Date()),
            ),
          )
          .limit(3)

        // Format and combine results
        const businessResultsFormatted = businessItems.map((profile) => ({
          id: profile.id,
          userId: profile.userId,
          name: profile.name,
          image: profile.logo || profile.userImage,
          type: "business",
          industry: profile.industry,
          description: profile.description,
        }))

        const professionalResultsFormatted = professionalItems.map((profile) => ({
          id: profile.id,
          userId: profile.userId,
          name: profile.name,
          image: profile.userImage,
          type: "professional",
          title: profile.title,
          company: profile.company,
          description: profile.description,
        }))

        const postResultsFormatted = postItems.map((post) => ({
          id: post.id,
          userId: post.userId,
          name: post.businessName || post.professionalName || post.userName,
          image: post.userImage,
          type: "post",
          content: post.content,
          createdAt: post.createdAt,
        }))

        const groupResultsFormatted = groupItems.map((group) => ({
          id: group.id,
          name: group.name,
          image: group.image,
          type: "group",
          description: group.description,
        }))

        const eventItemsFormatted = eventItems.map((event) => ({
          id: event.id,
          name: event.name,
          image: event.image,
          type: "event",
          description: event.description,
          startDate: event.startDate,
        }))

        results = [
          ...businessResultsFormatted,
          ...professionalResultsFormatted,
          ...postResultsFormatted,
          ...groupResultsFormatted,
          ...eventItemsFormatted,
        ]

        total = results.length
        break
    }

    return NextResponse.json({
      results,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

