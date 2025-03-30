import { drizzle } from "drizzle-orm/better-sqlite3"
import { eq, and, or, desc, sql } from "drizzle-orm"
import Database from "better-sqlite3"
import { nanoid } from "nanoid"
import * as schema from "./schema"

// Initialize SQLite database
const sqlite = new Database(process.env.DATABASE_URL || ":memory:")
export const db = drizzle(sqlite, { schema })

// User helper functions
export async function getUserByEmail(email: string) {
  const users = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)

  return users[0] || null
}

export async function getUserById(id: string) {
  const users = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1)

  return users[0] || null
}

export async function getUserByUsername(username: string) {
  const users = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1)

  return users[0] || null
}

export async function createUser(data: {
  name: string
  email: string
  password?: string
  image?: string
}) {
  const id = nanoid()

  await db.insert(schema.users).values({
    id,
    name: data.name,
    email: data.email,
    password: data.password,
    image: data.image,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return getUserById(id)
}

// Profile helper functions
export async function getProfileByUserId(userId: string) {
  const profiles = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, userId)).limit(1)

  return profiles[0] || null
}

export async function createProfile(data: {
  userId: string
  title?: string
  company?: string
  location?: string
  about?: string
  website?: string
  profileImage?: string
  coverImage?: string
}) {
  const id = nanoid()

  await db.insert(schema.profiles).values({
    id,
    userId: data.userId,
    title: data.title,
    company: data.company,
    location: data.location,
    about: data.about,
    website: data.website,
    profileImage: data.profileImage,
    coverImage: data.coverImage,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return getProfileByUserId(data.userId)
}

export async function updateProfile(
  userId: string,
  data: {
    title?: string
    company?: string
    location?: string
    about?: string
    website?: string
    profileImage?: string
    coverImage?: string
  },
) {
  const profile = await getProfileByUserId(userId)

  if (!profile) {
    return createProfile({ userId, ...data })
  }

  await db
    .update(schema.profiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.profiles.userId, userId))

  return getProfileByUserId(userId)
}

// Skills helper functions
export async function getUserSkills(userId: string) {
  const userSkills = await db
    .select({
      id: schema.skills.id,
      name: schema.skills.name,
      category: schema.skills.category,
      endorsements: schema.userSkills.endorsements,
    })
    .from(schema.userSkills)
    .innerJoin(schema.skills, eq(schema.userSkills.skillId, schema.skills.id))
    .where(eq(schema.userSkills.userId, userId))

  return userSkills
}

export async function addUserSkill(userId: string, skillName: string) {
  // Check if skill exists
  let skill = await db
    .select()
    .from(schema.skills)
    .where(eq(schema.skills.name, skillName))
    .limit(1)
    .then((rows) => rows[0])

  // Create skill if it doesn't exist
  if (!skill) {
    const skillId = nanoid()
    await db.insert(schema.skills).values({
      id: skillId,
      name: skillName,
      createdAt: new Date(),
    })
    skill = { id: skillId, name: skillName }
  }

  // Check if user already has this skill
  const existingUserSkill = await db
    .select()
    .from(schema.userSkills)
    .where(and(eq(schema.userSkills.userId, userId), eq(schema.userSkills.skillId, skill.id)))
    .limit(1)
    .then((rows) => rows[0])

  // Add skill to user if they don't have it
  if (!existingUserSkill) {
    await db.insert(schema.userSkills).values({
      userId,
      skillId: skill.id,
      endorsements: 0,
      createdAt: new Date(),
    })
  }

  return getUserSkills(userId)
}

export async function removeUserSkill(userId: string, skillId: string) {
  await db
    .delete(schema.userSkills)
    .where(and(eq(schema.userSkills.userId, userId), eq(schema.userSkills.skillId, skillId)))

  return getUserSkills(userId)
}

// Experience helper functions
export async function getUserExperiences(userId: string) {
  const experiences = await db
    .select()
    .from(schema.experiences)
    .where(eq(schema.experiences.userId, userId))
    .orderBy(desc(schema.experiences.startDate))

  return experiences
}

export async function addUserExperience(
  userId: string,
  data: {
    title: string
    company: string
    location?: string
    startDate: string
    endDate?: string
    description?: string
  },
) {
  const id = nanoid()

  await db.insert(schema.experiences).values({
    id,
    userId,
    title: data.title,
    company: data.company,
    location: data.location,
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return getUserExperiences(userId)
}

export async function updateUserExperience(
  id: string,
  userId: string,
  data: {
    title?: string
    company?: string
    location?: string
    startDate?: string
    endDate?: string
    description?: string
  },
) {
  await db
    .update(schema.experiences)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.experiences.id, id), eq(schema.experiences.userId, userId)))

  return getUserExperiences(userId)
}

export async function removeUserExperience(id: string, userId: string) {
  await db.delete(schema.experiences).where(and(eq(schema.experiences.id, id), eq(schema.experiences.userId, userId)))

  return getUserExperiences(userId)
}

// Education helper functions
export async function getUserEducation(userId: string) {
  const education = await db
    .select()
    .from(schema.education)
    .where(eq(schema.education.userId, userId))
    .orderBy(desc(schema.education.startYear))

  return education
}

export async function addUserEducation(
  userId: string,
  data: {
    school: string
    degree: string
    field: string
    startYear: string
    endYear?: string
    description?: string
  },
) {
  const id = nanoid()

  await db.insert(schema.education).values({
    id,
    userId,
    school: data.school,
    degree: data.degree,
    field: data.field,
    startYear: data.startYear,
    endYear: data.endYear,
    description: data.description,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return getUserEducation(userId)
}

export async function updateUserEducation(
  id: string,
  userId: string,
  data: {
    school?: string
    degree?: string
    field?: string
    startYear?: string
    endYear?: string
    description?: string
  },
) {
  await db
    .update(schema.education)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.education.id, id), eq(schema.education.userId, userId)))

  return getUserEducation(userId)
}

export async function removeUserEducation(id: string, userId: string) {
  await db.delete(schema.education).where(and(eq(schema.education.id, id), eq(schema.education.userId, userId)))

  return getUserEducation(userId)
}

// Social Links helper functions
export async function getUserSocialLinks(userId: string) {
  const socialLinks = await db.select().from(schema.socialLinks).where(eq(schema.socialLinks.userId, userId))

  return socialLinks
}

export async function addUserSocialLink(
  userId: string,
  data: {
    platform: string
    url: string
  },
) {
  const id = nanoid()

  await db.insert(schema.socialLinks).values({
    id,
    userId,
    platform: data.platform,
    url: data.url,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return getUserSocialLinks(userId)
}

export async function updateUserSocialLink(
  id: string,
  userId: string,
  data: {
    platform?: string
    url?: string
  },
) {
  await db
    .update(schema.socialLinks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.socialLinks.id, id), eq(schema.socialLinks.userId, userId)))

  return getUserSocialLinks(userId)
}

export async function removeUserSocialLink(id: string, userId: string) {
  await db.delete(schema.socialLinks).where(and(eq(schema.socialLinks.id, id), eq(schema.socialLinks.userId, userId)))

  return getUserSocialLinks(userId)
}

// Connection helper functions
export async function getUserConnections(userId: string) {
  const connections = await db
    .select({
      id: schema.connections.id,
      userId: schema.connections.userId,
      connectedUserId: schema.connections.connectedUserId,
      status: schema.connections.status,
      createdAt: schema.connections.createdAt,
      updatedAt: schema.connections.updatedAt,
      name: schema.users.name,
      image: schema.users.image,
      title: schema.profiles.title,
      company: schema.profiles.company,
    })
    .from(schema.connections)
    .innerJoin(schema.users, eq(schema.connections.connectedUserId, schema.users.id))
    .leftJoin(schema.profiles, eq(schema.connections.connectedUserId, schema.profiles.userId))
    .where(and(eq(schema.connections.userId, userId), eq(schema.connections.status, "ACCEPTED")))

  return connections
}

export async function getConnectionRequests(userId: string) {
  const requests = await db
    .select({
      id: schema.connections.id,
      userId: schema.connections.userId,
      connectedUserId: schema.connections.connectedUserId,
      status: schema.connections.status,
      createdAt: schema.connections.createdAt,
      updatedAt: schema.connections.updatedAt,
      name: schema.users.name,
      image: schema.users.image,
      title: schema.profiles.title,
      company: schema.profiles.company,
    })
    .from(schema.connections)
    .innerJoin(schema.users, eq(schema.connections.userId, schema.users.id))
    .leftJoin(schema.profiles, eq(schema.connections.userId, schema.profiles.userId))
    .where(and(eq(schema.connections.connectedUserId, userId), eq(schema.connections.status, "PENDING")))

  return requests
}

export async function createConnection(userId: string, connectedUserId: string) {
  const id = nanoid()

  await db.insert(schema.connections).values({
    id,
    userId,
    connectedUserId,
    status: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // Create notification for connection request
  await createNotification({
    userId: connectedUserId,
    type: "CONNECTION_REQUEST",
    actorId: userId,
    entityId: id,
    entityType: "CONNECTION",
    message: "sent you a connection request",
  })

  return getUserConnections(userId)
}

export async function updateConnectionStatus(id: string, userId: string, status: "ACCEPTED" | "REJECTED") {
  const connection = await db
    .select()
    .from(schema.connections)
    .where(and(eq(schema.connections.id, id), eq(schema.connections.connectedUserId, userId)))
    .limit(1)
    .then((rows) => rows[0])

  if (!connection) {
    throw new Error("Connection not found")
  }

  await db
    .update(schema.connections)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(schema.connections.id, id))

  if (status === "ACCEPTED") {
    // Create notification for accepted connection
    await createNotification({
      userId: connection.userId,
      type: "CONNECTION_ACCEPTED",
      actorId: userId,
      entityId: id,
      entityType: "CONNECTION",
      message: "accepted your connection request",
    })
  }

  return getConnectionRequests(userId)
}

// Post helper functions
export async function getFeedPosts(userId: string, page = 1, limit = 10) {
  const offset = (page - 1) * limit

  // Get user's connections
  const connections = await getUserConnections(userId)
  const connectionIds = connections.map((c) => c.connectedUserId)

  // Get posts from user and connections
  const posts = await db
    .select({
      id: schema.posts.id,
      userId: schema.posts.userId,
      content: schema.posts.content,
      imageUrl: schema.posts.imageUrl,
      videoUrl: schema.posts.videoUrl,
      linkUrl: schema.posts.linkUrl,
      linkTitle: schema.posts.linkTitle,
      linkDescription: schema.posts.linkDescription,
      linkImage: schema.posts.linkImage,
      visibility: schema.posts.visibility,
      status: schema.posts.status,
      likes: schema.posts.likes,
      comments: schema.posts.comments,
      shares: schema.posts.shares,
      createdAt: schema.posts.createdAt,
      updatedAt: schema.posts.updatedAt,
      userName: schema.users.name,
      userImage: schema.users.image,
      userTitle: schema.profiles.title,
      userCompany: schema.profiles.company,
    })
    .from(schema.posts)
    .innerJoin(schema.users, eq(schema.posts.userId, schema.users.id))
    .leftJoin(schema.profiles, eq(schema.posts.userId, schema.profiles.userId))
    .where(
      and(
        eq(schema.posts.status, "PUBLISHED"),
        or(
          eq(schema.posts.userId, userId),
          and(
            eq(schema.posts.visibility, "PUBLIC"),
            sql`${schema.posts.userId} IN (${connectionIds.length > 0 ? connectionIds : [null]})`,
          ),
          and(
            eq(schema.posts.visibility, "CONNECTIONS"),
            sql`${schema.posts.userId} IN (${connectionIds.length > 0 ? connectionIds : [null]})`,
          ),
        ),
      ),
    )
    .orderBy(desc(schema.posts.createdAt))
    .limit(limit)
    .offset(offset)

  return posts
}

export async function createPost(
  userId: string,
  data: {
    content: string
    imageUrl?: string
    videoUrl?: string
    linkUrl?: string
    linkTitle?: string
    linkDescription?: string
    linkImage?: string
    visibility?: "PUBLIC" | "CONNECTIONS" | "PRIVATE"
  },
) {
  const id = nanoid()

  await db.insert(schema.posts).values({
    id,
    userId,
    content: data.content,
    imageUrl: data.imageUrl,
    videoUrl: data.videoUrl,
    linkUrl: data.linkUrl,
    linkTitle: data.linkTitle,
    linkDescription: data.linkDescription,
    linkImage: data.linkImage,
    visibility: data.visibility || "PUBLIC",
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return getPostById(id)
}

export async function getPostById(id: string) {
  const posts = await db
    .select({
      id: schema.posts.id,
      userId: schema.posts.userId,
      content: schema.posts.content,
      imageUrl: schema.posts.imageUrl,
      videoUrl: schema.posts.videoUrl,
      linkUrl: schema.posts.linkUrl,
      linkTitle: schema.posts.linkTitle,
      linkDescription: schema.posts.linkDescription,
      linkImage: schema.posts.linkImage,
      visibility: schema.posts.visibility,
      status: schema.posts.status,
      likes: schema.posts.likes,
      comments: schema.posts.comments,
      shares: schema.posts.shares,
      createdAt: schema.posts.createdAt,
      updatedAt: schema.posts.updatedAt,
      userName: schema.users.name,
      userImage: schema.users.image,
      userTitle: schema.profiles.title,
      userCompany: schema.profiles.company,
    })
    .from(schema.posts)
    .innerJoin(schema.users, eq(schema.posts.userId, schema.users.id))
    .leftJoin(schema.profiles, eq(schema.posts.userId, schema.profiles.userId))
    .where(eq(schema.posts.id, id))
    .limit(1)

  return posts[0] || null
}

// Notification helper functions
export async function getUserNotifications(userId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit

  const notifications = await db
    .select({
      id: schema.notifications.id,
      userId: schema.notifications.userId,
      type: schema.notifications.type,
      actorId: schema.notifications.actorId,
      entityId: schema.notifications.entityId,
      entityType: schema.notifications.entityType,
      message: schema.notifications.message,
      isRead: schema.notifications.isRead,
      createdAt: schema.notifications.createdAt,
      actorName: schema.users.name,
      actorImage: schema.users.image,
    })
    .from(schema.notifications)
    .leftJoin(schema.users, eq(schema.notifications.actorId, schema.users.id))
    .where(eq(schema.notifications.userId, userId))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(limit)
    .offset(offset)

  return notifications
}

export async function createNotification(data: {
  userId: string
  type: "CONNECTION_REQUEST" | "CONNECTION_ACCEPTED" | "POST_LIKE" | "POST_COMMENT" | "COMMENT_LIKE" | "MENTION"
  actorId?: string
  entityId?: string
  entityType?: "POST" | "COMMENT" | "CONNECTION"
  message: string
}) {
  const id = nanoid()

  await db.insert(schema.notifications).values({
    id,
    userId: data.userId,
    type: data.type,
    actorId: data.actorId,
    entityId: data.entityId,
    entityType: data.entityType,
    message: data.message,
    isRead: false,
    createdAt: new Date(),
  })

  return getUserNotifications(data.userId)
}

export async function markNotificationAsRead(id: string, userId: string) {
  await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(and(eq(schema.notifications.id, id), eq(schema.notifications.userId, userId)))

  return getUserNotifications(userId)
}

export async function markAllNotificationsAsRead(userId: string) {
  await db.update(schema.notifications).set({ isRead: true }).where(eq(schema.notifications.userId, userId))

  return getUserNotifications(userId)
}

