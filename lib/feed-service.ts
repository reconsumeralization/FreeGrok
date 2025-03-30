import { db } from "@/db"
import { feeds } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getFeeds() {
  try {
    const allFeeds = await db.select().from(feeds)
    return allFeeds
  } catch (error) {
    console.error("Error fetching feeds:", error)
    return []
  }
}

export async function getFeedById(id: number) {
  try {
    const feed = await db.select().from(feeds).where(eq(feeds.id, id))
    return feed[0] || null
  } catch (error) {
    console.error(`Error fetching feed with id ${id}:`, error)
    return null
  }
}

export async function createFeed(title: string, url: string, description: string | null = null) {
  try {
    const newFeed = await db
      .insert(feeds)
      .values({
        title,
        url,
        description,
      })
      .returning()
    return newFeed[0]
  } catch (error) {
    console.error("Error creating feed:", error)
    return null
  }
}

export async function updateFeed(id: number, title: string, url: string, description: string | null = null) {
  try {
    const updatedFeed = await db
      .update(feeds)
      .set({
        title,
        url,
        description,
      })
      .where(eq(feeds.id, id))
      .returning()
    return updatedFeed[0]
  } catch (error) {
    console.error(`Error updating feed with id ${id}:`, error)
    return null
  }
}

export async function deleteFeed(id: number) {
  try {
    await db.delete(feeds).where(eq(feeds.id, id))
    return true
  } catch (error) {
    console.error(`Error deleting feed with id ${id}:`, error)
    return false
  }
}

