import { db } from "@/db"
import { collaborations } from "@/db/schema"
import { eq } from "drizzle-orm"
import { collaborationParticipants } from "@/db/schema"

export async function getCollaborationById(id: string) {
  try {
    const collaboration = await db.query.collaborations.findFirst({
      where: eq(collaborations.id, id),
      with: {
        owner: true,
        participants: {
          with: {
            user: true,
          },
        },
      },
    })

    return collaboration
  } catch (error) {
    console.error("Error fetching collaboration:", error)
    return null
  }
}

export async function createCollaboration(name: string, ownerId: string, description?: string) {
  try {
    const newCollaboration = await db
      .insert(collaborations)
      .values({
        name: name,
        ownerId: ownerId,
        description: description,
      })
      .returning()

    return newCollaboration[0]
  } catch (error) {
    console.error("Error creating collaboration:", error)
    return null
  }
}

export async function updateCollaboration(id: string, name?: string, description?: string) {
  try {
    const updatedCollaboration = await db
      .update(collaborations)
      .set({
        name: name,
        description: description,
      })
      .where(eq(collaborations.id, id))
      .returning()

    return updatedCollaboration[0]
  } catch (error) {
    console.error("Error updating collaboration:", error)
    return null
  }
}

export async function deleteCollaboration(id: string) {
  try {
    await db.delete(collaborations).where(eq(collaborations.id, id))
    return true
  } catch (error) {
    console.error("Error deleting collaboration:", error)
    return false
  }
}

export async function addParticipantToCollaboration(collaborationId: string, userId: string) {
  try {
    // Check if the user already exists in the collaboration
    const existingParticipant = await db.query.collaborationParticipants.findFirst({
      where: (fields, operators) =>
        operators.and(operators.eq(fields.collaborationId, collaborationId), operators.eq(fields.userId, userId)),
    })

    if (existingParticipant) {
      console.warn("User is already a participant in this collaboration.")
      return false // Or throw an error, depending on your desired behavior
    }

    // await db.insert(collaborations).values({ // Incorrect insert statement
    //   id: collaborationId,
    //   ownerId: userId,
    // })
    await db.insert(collaborationParticipants).values({
      collaborationId: collaborationId,
      userId: userId,
    })
    return true
  } catch (error) {
    console.error("Error adding participant to collaboration:", error)
    return false
  }
}

export async function removeParticipantFromCollaboration(collaborationId: string, userId: string) {
  try {
    // await db.delete(collaborations).where(eq(collaborations.id, collaborationId)) // Incorrect delete statement
    await db
      .delete(collaborationParticipants)
      .where((fields, operators) =>
        operators.and(operators.eq(fields.collaborationId, collaborationId), operators.eq(fields.userId, userId)),
      )
    return true
  } catch (error) {
    console.error("Error removing participant from collaboration:", error)
    return false
  }
}

