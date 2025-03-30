import { db } from "@/db"
import { posts, users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function moderatePost(postId: string, approved: boolean) {
  try {
    // Update the post's moderation status in the database
    await db.update(posts).set({ approved: approved }).where(eq(posts.id, postId))

    return { success: true, message: `Post ${postId} ${approved ? "approved" : "rejected"} successfully.` }
  } catch (error) {
    console.error("Error moderating post:", error)
    return { success: false, message: "Failed to moderate post." }
  }
}

export async function getUser(userId: string) {
  try {
    const user = await db.select().from(users).where(eq(users.id, userId))

    if (user.length === 0) {
      return null
    }

    return user[0]
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

