import { db } from "@/db"
import { knowledge } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getKnowledge(id: string) {
  try {
    const k = await db.select().from(knowledge).where(eq(knowledge.id, id))
    return k[0] ?? null
  } catch (error) {
    console.error("Error getting knowledge:", error)
    return null
  }
}

export async function createKnowledge(title: string, content: string, userId: string) {
  try {
    const k = await db
      .insert(knowledge)
      .values({
        title,
        content,
        userId,
      })
      .returning()
    return k[0]
  } catch (error) {
    console.error("Error creating knowledge:", error)
    return null
  }
}

export async function updateKnowledge(id: string, title: string, content: string) {
  try {
    const k = await db
      .update(knowledge)
      .set({
        title,
        content,
      })
      .where(eq(knowledge.id, id))
      .returning()
    return k[0]
  } catch (error) {
    console.error("Error updating knowledge:", error)
    return null
  }
}

export async function deleteKnowledge(id: string) {
  try {
    await db.delete(knowledge).where(eq(knowledge.id, id))
    return true
  } catch (error) {
    console.error("Error deleting knowledge:", error)
    return false
  }
}

