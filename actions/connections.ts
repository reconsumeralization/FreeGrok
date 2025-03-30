'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db' // Assuming db client is here
import { connections } from '@/db/schema'
import { auth } from '@/lib/auth' // Assuming auth helper is here
import { and, eq, or, not } from 'drizzle-orm'
import { z } from 'zod'

// --- Helper Function to Get Current User --- //
async function getCurrentUser() {
  const session = await auth() // Using your auth setup
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }
  return session.user
}

// --- Zod Schemas for Input Validation --- //
const ConnectionIdSchema = z.string().uuid()
const UserIdSchema = z.string()

// --- Server Actions --- //

/**
 * Sends a connection request from the current user to another user.
 * @param targetUserId - The ID of the user to send the request to.
 */
export async function sendConnectionRequest(targetUserId: string) {
  const validatedTargetUserId = UserIdSchema.parse(targetUserId)
  const currentUser = await getCurrentUser()

  if (currentUser.id === validatedTargetUserId) {
    return { error: 'You cannot connect with yourself.' }
  }

  try {
    // Check if a connection or request already exists
    const existingConnection = await db.query.connections.findFirst({
      where: or(
        and(
          eq(connections.userOneId, currentUser.id),
          eq(connections.userTwoId, validatedTargetUserId)
        ),
        and(
          eq(connections.userOneId, validatedTargetUserId),
          eq(connections.userTwoId, currentUser.id)
        )
      ),
    })

    if (existingConnection) {
      if (existingConnection.status === 'ACCEPTED') {
        return { error: 'Already connected.' }
      } else if (existingConnection.status === 'PENDING') {
        // If the other user sent the request, accept it instead
        if (existingConnection.userOneId === validatedTargetUserId) {
          return await acceptConnectionRequest(existingConnection.id)
        }
        return { error: 'Request already sent.' }
      } else if (existingConnection.status === 'BLOCKED') {
        return { error: 'Cannot send request, connection is blocked.' }
      }
    }

    // Create new connection request
    const [newConnection] = await db
      .insert(connections)
      .values({
        userOneId: currentUser.id,
        userTwoId: validatedTargetUserId,
        status: 'PENDING',
      })
      .returning()

    revalidatePath('/network') // Or relevant profile path
    revalidatePath(`/profile/${validatedTargetUserId}`)
    return { success: true, connection: newConnection }
  } catch (error) {
    console.error('Error sending connection request:', error)
    return { error: 'Failed to send connection request.' }
  }
}

/**
 * Accepts a pending connection request.
 * @param connectionId - The ID of the connection request (in connections table).
 */
export async function acceptConnectionRequest(connectionId: string) {
  const validatedConnectionId = ConnectionIdSchema.parse(connectionId)
  const currentUser = await getCurrentUser()

  try {
    const request = await db.query.connections.findFirst({
      where: and(
        eq(connections.id, validatedConnectionId),
        eq(connections.status, 'PENDING')
      ),
    })

    if (!request) {
      return { error: 'Request not found or already handled.' }
    }

    // Ensure the current user is the recipient of the request
    if (request.userTwoId !== currentUser.id) {
      return { error: 'Unauthorized to accept this request.' }
    }

    const [updatedConnection] = await db
      .update(connections)
      .set({ status: 'ACCEPTED', updatedAt: new Date() })
      .where(eq(connections.id, validatedConnectionId))
      .returning()

    revalidatePath('/network') // Or relevant paths
    revalidatePath(`/profile/${request.userOneId}`)
    revalidatePath(`/profile/${currentUser.id}`)

    // TODO: Create a notification for the sender

    return { success: true, connection: updatedConnection }
  } catch (error) {
    console.error('Error accepting connection request:', error)
    return { error: 'Failed to accept connection request.' }
  }
}

/**
 * Rejects or cancels a pending connection request.
 * @param connectionId - The ID of the connection request.
 */
export async function rejectOrCancelConnectionRequest(connectionId: string) {
  const validatedConnectionId = ConnectionIdSchema.parse(connectionId)
  const currentUser = await getCurrentUser()

  try {
    const request = await db.query.connections.findFirst({
      where: and(
        eq(connections.id, validatedConnectionId),
        eq(connections.status, 'PENDING')
      ),
    })

    if (!request) {
      return { error: 'Request not found or already handled.' }
    }

    // Ensure the current user is either the sender or receiver
    if (
      request.userOneId !== currentUser.id &&
      request.userTwoId !== currentUser.id
    ) {
      return { error: 'Unauthorized to handle this request.' }
    }

    await db
      .delete(connections)
      .where(eq(connections.id, validatedConnectionId))

    revalidatePath('/network') // Or relevant paths
    revalidatePath(`/profile/${request.userOneId}`)
    revalidatePath(`/profile/${request.userTwoId}`)

    // TODO: Optionally create a notification if rejected (not cancelled)

    return { success: true }
  } catch (error) {
    console.error('Error rejecting/cancelling connection request:', error)
    return { error: 'Failed to reject/cancel connection request.' }
  }
}

/**
 * Removes an existing connection.
 * @param connectionId - The ID of the connection to remove.
 */
export async function removeConnection(connectionId: string) {
  const validatedConnectionId = ConnectionIdSchema.parse(connectionId)
  const currentUser = await getCurrentUser()

  try {
    const connection = await db.query.connections.findFirst({
      where: and(
        eq(connections.id, validatedConnectionId),
        eq(connections.status, 'ACCEPTED'),
        or(
          eq(connections.userOneId, currentUser.id),
          eq(connections.userTwoId, currentUser.id)
        )
      ),
    })

    if (!connection) {
      return { error: 'Connection not found or you are not part of it.' }
    }

    await db
      .delete(connections)
      .where(eq(connections.id, validatedConnectionId))

    revalidatePath('/network') // Or relevant paths
    revalidatePath(`/profile/${connection.userOneId}`)
    revalidatePath(`/profile/${connection.userTwoId}`)

    return { success: true }
  } catch (error) {
    console.error('Error removing connection:', error)
    return { error: 'Failed to remove connection.' }
  }
}

/**
 * Blocks a user, preventing future connection requests.
 * @param targetUserId - The ID of the user to block.
 */
export async function blockUser(targetUserId: string) {
  const validatedTargetUserId = UserIdSchema.parse(targetUserId)
  const currentUser = await getCurrentUser()

  if (currentUser.id === validatedTargetUserId) {
    return { error: 'You cannot block yourself.' }
  }

  try {
    // Check if connection exists and update status to BLOCKED
    // Or create a new connection with status BLOCKED
    const [blockedConnection] = await db
      .insert(connections)
      .values({
        userOneId: currentUser.id, // The user performing the block
        userTwoId: validatedTargetUserId, // The user being blocked
        status: 'BLOCKED',
      })
      .onConflictDoUpdate({
        target: [connections.userOneId, connections.userTwoId], // Assuming you add a unique constraint
        set: { status: 'BLOCKED', updatedAt: new Date() },
        where: or(
          // Ensure we only update if the relationship already exists between these two regardless of direction
          and(
            eq(connections.userOneId, currentUser.id),
            eq(connections.userTwoId, validatedTargetUserId)
          ),
          and(
            eq(connections.userOneId, validatedTargetUserId),
            eq(connections.userTwoId, currentUser.id)
          )
        ),
      })
      // If no unique constraint, we need to query first, then update or insert.
      // This is a simplified example assuming a unique constraint or handling upsert logic.
      .returning()

    // Clean up potential pending requests after blocking
    await db
      .delete(connections)
      .where(
        and(
          eq(connections.status, 'PENDING'),
          or(
            and(
              eq(connections.userOneId, currentUser.id),
              eq(connections.userTwoId, validatedTargetUserId)
            ),
            and(
              eq(connections.userOneId, validatedTargetUserId),
              eq(connections.userTwoId, currentUser.id)
            )
          )
        )
      )

    revalidatePath('/network')
    revalidatePath(`/profile/${validatedTargetUserId}`)
    revalidatePath(`/profile/${currentUser.id}`)

    return { success: true, connection: blockedConnection }
  } catch (error) {
    console.error('Error blocking user:', error)
    return { error: 'Failed to block user.' }
  }
}

/**
 * Unblocks a user.
 * @param blockedUserId - The ID of the user to unblock.
 */
export async function unblockUser(blockedUserId: string) {
  const validatedBlockedUserId = UserIdSchema.parse(blockedUserId)
  const currentUser = await getCurrentUser()

  try {
    // Find the block record initiated by the current user
    const result = await db
      .delete(connections)
      .where(
        and(
          eq(connections.userOneId, currentUser.id),
          eq(connections.userTwoId, validatedBlockedUserId),
          eq(connections.status, 'BLOCKED')
        )
      )
      .returning({ id: connections.id })

    if (result.length === 0) {
      return {
        error: 'Block record not found or you did not initiate this block.',
      }
    }

    revalidatePath('/network')
    revalidatePath(`/profile/${validatedBlockedUserId}`)
    revalidatePath(`/profile/${currentUser.id}`)

    return { success: true }
  } catch (error) {
    console.error('Error unblocking user:', error)
    return { error: 'Failed to unblock user.' }
  }
}

// --- Functions to Get Connection Data --- //

/**
 * Gets the connection status between the current user and another user.
 * @param targetUserId
 * @returns { status: 'CONNECTED' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'BLOCKED' | 'SELF' | 'NONE', connectionId?: string }
 */
export async function getConnectionStatus(targetUserId: string) {
  try {
    const currentUser = await getCurrentUser()
    if (currentUser.id === targetUserId) return { status: 'SELF' }

    const connection = await db.query.connections.findFirst({
      where: or(
        and(
          eq(connections.userOneId, currentUser.id),
          eq(connections.userTwoId, targetUserId)
        ),
        and(
          eq(connections.userOneId, targetUserId),
          eq(connections.userTwoId, currentUser.id)
        )
      ),
      columns: { id: true, status: true, userOneId: true },
    })

    if (!connection) {
      return { status: 'NONE' }
    }

    if (connection.status === 'ACCEPTED') {
      return { status: 'CONNECTED', connectionId: connection.id }
    } else if (connection.status === 'PENDING') {
      if (connection.userOneId === currentUser.id) {
        return { status: 'PENDING_SENT', connectionId: connection.id }
      } else {
        return { status: 'PENDING_RECEIVED', connectionId: connection.id }
      }
    } else if (connection.status === 'BLOCKED') {
      // Important: Check who initiated the block
      if (connection.userOneId === currentUser.id) {
        return { status: 'BLOCKED', connectionId: connection.id } // Current user blocked target
      } else {
        // Target user blocked current user - treat as NONE from current user's perspective
        // Or return a specific status like 'BLOCKED_BY_OTHER' if needed by UI
        return { status: 'NONE' }
      }
    }

    return { status: 'NONE' } // Default case
  } catch (error) {
    // Handle not authenticated error gracefully for public profile viewing
    if (error instanceof Error && error.message === 'Not authenticated') {
      return { status: 'NONE' } // Treat as no connection if user isn't logged in
    }
    console.error('Error getting connection status:', error)
    // Don't throw error, return default status
    return { status: 'NONE' }
  }
}

/**
 * Gets a list of accepted connections for the current user.
 */
export async function getConnections() {
  const currentUser = await getCurrentUser()

  try {
    const results = await db.query.connections.findMany({
      where: and(
        eq(connections.status, 'ACCEPTED'),
        or(
          eq(connections.userOneId, currentUser.id),
          eq(connections.userTwoId, currentUser.id)
        )
      ),
      with: {
        userOne: { columns: { id: true, name: true, image: true } }, // Customize returned fields
        userTwo: { columns: { id: true, name: true, image: true } },
      },
    })

    // Map results to show the *other* user in the connection
    const connectionsList = results.map((conn) => {
      const otherUser =
        conn.userOneId === currentUser.id ? conn.userTwo : conn.userOne
      return {
        connectionId: conn.id,
        userId: otherUser.id,
        name: otherUser.name,
        image: otherUser.image,
        connectedAt: conn.updatedAt, // Use updatedAt as connection acceptance time
      }
    })

    return { connections: connectionsList }
  } catch (error) {
    console.error('Error fetching connections:', error)
    return { error: 'Failed to fetch connections.' }
  }
}

/**
 * Gets a list of pending incoming connection requests for the current user.
 */
export async function getPendingRequests() {
  const currentUser = await getCurrentUser()

  try {
    const results = await db.query.connections.findMany({
      where: and(
        eq(connections.status, 'PENDING'),
        eq(connections.userTwoId, currentUser.id) // Requests where current user is the recipient
      ),
      with: {
        userOne: { columns: { id: true, name: true, image: true } }, // The user who sent the request
      },
      orderBy: (connections, { desc }) => [desc(connections.createdAt)],
    })

    const requestsList = results.map((req) => ({
      connectionId: req.id,
      senderId: req.userOne.id,
      senderName: req.userOne.name,
      senderImage: req.userOne.image,
      requestedAt: req.createdAt,
    }))

    return { requests: requestsList }
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    return { error: 'Failed to fetch pending requests.' }
  }
}
