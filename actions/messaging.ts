'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import {
  conversations,
  messages,
  conversationParticipants,
  users,
} from '@/db/schema'
import { auth } from '@/lib/auth'
import { and, eq, or, desc, inArray, sql, notEq } from 'drizzle-orm'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid' // For generating UUIDs

// --- Helper Function to Get Current User --- //
async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }
  return session.user
}

// --- Zod Schemas for Input Validation --- //
const ConversationIdSchema = z.string().uuid()
const UserIdSchema = z.string() // Assuming user IDs are not necessarily UUIDs from auth
const MessageContentSchema = z.string().min(1).max(2000) // Example validation
const ParticipantIdsSchema = z.array(UserIdSchema).min(1) // At least one other participant

// --- Server Actions --- //

/**
 * Gets a list of conversations for the current user.
 */
export async function getConversations() {
  const currentUser = await getCurrentUser()

  try {
    // Find all conversation participant records for the current user
    const userConversationLinks =
      await db.query.conversationParticipants.findMany({
        where: eq(conversationParticipants.userId, currentUser.id),
        columns: { conversationId: true, lastReadAt: true },
      })

    if (userConversationLinks.length === 0) {
      return { conversations: [] }
    }

    const conversationIds = userConversationLinks.map(
      (link) => link.conversationId
    )

    // Fetch conversations with their participants and latest message
    const results = await db.query.conversations.findMany({
      where: inArray(conversations.id, conversationIds),
      with: {
        participantsLink: {
          with: {
            user: { columns: { id: true, name: true, image: true } },
          },
        },
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 1,
          columns: { id: true, content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: [desc(conversations.updatedAt)], // Or order by last message timestamp
    })

    // Format the results
    const formattedConversations = await Promise.all(
      results.map(async (conv) => {
        const otherParticipants = conv.participantsLink
          .map((p) => p.user)
          .filter((u) => u.id !== currentUser.id)
        const latestMessage = conv.messages[0]
        const userLink = userConversationLinks.find(
          (link) => link.conversationId === conv.id
        )

        // Calculate unread count
        const unreadCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              userLink?.lastReadAt
                ? sql`${messages.createdAt} > ${userLink.lastReadAt}`
                : sql`1=1`,
              notEq(messages.senderId, currentUser.id) // Don't count user's own messages
            )
          )
          .then((res) => res[0]?.count ?? 0)

        return {
          id: conv.id,
          name: conv.isGroup
            ? conv.name || generateGroupName(otherParticipants)
            : otherParticipants[0]?.name || 'Unknown User',
          isGroup: conv.isGroup,
          participants: otherParticipants,
          latestMessage: latestMessage
            ? {
                content: latestMessage.content,
                createdAt: latestMessage.createdAt,
                isOwn: latestMessage.senderId === currentUser.id,
              }
            : null,
          updatedAt: conv.updatedAt,
          unreadCount,
        }
      })
    )

    return { conversations: formattedConversations }
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return { error: 'Failed to fetch conversations.' }
  }
}

// Helper function to generate a group name based on participants
function generateGroupName(participants) {
  if (participants.length === 0) return 'Empty Group'
  if (participants.length === 1) return `${participants[0].name}'s Group`
  if (participants.length === 2)
    return `${participants[0].name} and ${participants[1].name}`

  return `${participants[0].name}, ${participants[1].name} and ${
    participants.length - 2
  } others`
}

/**
 * Gets messages for a specific conversation.
 * @param conversationId
 */
export async function getMessages(conversationId: string) {
  const validatedConversationId = ConversationIdSchema.parse(conversationId)
  const currentUser = await getCurrentUser()

  try {
    // Verify user is part of the conversation
    const participantCheck = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, validatedConversationId),
        eq(conversationParticipants.userId, currentUser.id)
      ),
      columns: { userId: true },
    })

    if (!participantCheck) {
      return { error: 'Access denied to this conversation.' }
    }

    // Fetch messages
    const messagesList = await db.query.messages.findMany({
      where: eq(messages.conversationId, validatedConversationId),
      orderBy: [messages.createdAt],
      with: {
        sender: { columns: { id: true, name: true, image: true } },
      },
    })

    // Optionally mark as read when fetching messages
    await markConversationAsRead(validatedConversationId)

    return { messages: messagesList }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return { error: 'Failed to fetch messages.' }
  }
}

/**
 * Sends a message to a conversation.
 * @param conversationId
 * @param content
 */
export async function sendMessage(conversationId: string, content: string) {
  const validatedConversationId = ConversationIdSchema.parse(conversationId)
  const validatedContent = MessageContentSchema.parse(content)
  const currentUser = await getCurrentUser()

  try {
    // Verify user is part of the conversation
    const participantCheck = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, validatedConversationId),
        eq(conversationParticipants.userId, currentUser.id)
      ),
      columns: { userId: true },
    })

    if (!participantCheck) {
      return { error: 'Cannot send message to this conversation.' }
    }

    // Insert the message and update conversation timestamp in a transaction
    const newMessage = await db.transaction(async (tx) => {
      const [insertedMessage] = await tx
        .insert(messages)
        .values({
          id: uuidv4(),
          conversationId: validatedConversationId,
          senderId: currentUser.id,
          content: validatedContent,
          contentType: 'TEXT',
        })
        .returning()

      // Update conversation's updatedAt timestamp
      await tx
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, validatedConversationId))

      // Update sender's lastReadAt
      await tx
        .update(conversationParticipants)
        .set({ lastReadAt: new Date() })
        .where(
          and(
            eq(
              conversationParticipants.conversationId,
              validatedConversationId
            ),
            eq(conversationParticipants.userId, currentUser.id)
          )
        )

      return insertedMessage
    })

    // Revalidate path for the conversation page (if applicable)
    revalidatePath(`/messages/${validatedConversationId}`)
    // Also revalidate a general messages list path
    revalidatePath('/messages')

    // TODO: Trigger push notification or realtime event

    return { success: true, message: newMessage }
  } catch (error) {
    console.error('Error sending message:', error)
    return { error: 'Failed to send message.' }
  }
}

/**
 * Creates a new conversation with specified participants and an initial message.
 * Automatically handles 1-on-1 vs group creation.
 * Checks if a 1-on-1 conversation already exists.
 * @param participantUserIds - Array of user IDs (excluding the current user).
 * @param initialMessageContent - The content of the first message.
 */
export async function createConversation(
  participantUserIds: string[],
  initialMessageContent: string
) {
  const validatedParticipantIds = ParticipantIdsSchema.parse(participantUserIds)
  const validatedInitialMessage = MessageContentSchema.parse(
    initialMessageContent
  )
  const currentUser = await getCurrentUser()

  const allParticipantIds = [
    ...new Set([currentUser.id, ...validatedParticipantIds]),
  ] // Ensure unique IDs including current user

  if (allParticipantIds.length < 2) {
    return { error: 'Conversation requires at least two participants.' }
  }

  const isGroup = allParticipantIds.length > 2

  try {
    let conversationId: string
    let isNewConversation = true

    // For 1-on-1 chats, check if a conversation already exists
    if (!isGroup) {
      const otherUserId = validatedParticipantIds[0]
      const existingConversation =
        await db.query.conversationParticipants.findMany({
          where: or(
            eq(conversationParticipants.userId, currentUser.id),
            eq(conversationParticipants.userId, otherUserId)
          ),
          columns: { conversationId: true, userId: true },
        })

      // Group by conversationId to find conversations with exactly these two participants
      const conversationCounts = existingConversation.reduce<
        Record<string, string[]>
      >((acc, curr) => {
        acc[curr.conversationId] = acc[curr.conversationId] || []
        acc[curr.conversationId].push(curr.userId)
        return acc
      }, {})

      const existingDirectConvId = Object.entries(conversationCounts).find(
        ([_, userIds]) => {
          return (
            userIds.length === 2 &&
            userIds.includes(currentUser.id) &&
            userIds.includes(otherUserId)
          )
        }
      )

      if (existingDirectConvId) {
        // Found existing 1-on-1 conversation
        conversationId = existingDirectConvId[0]
        isNewConversation = false

        // Update conversation timestamp as activity happened
        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, conversationId))
      } else {
        // No existing 1-on-1, proceed to create new
        conversationId = uuidv4()
      }
    } else {
      // For group chats, always create a new conversation
      conversationId = uuidv4()
    }

    // Use a transaction for creating conversation, participants, and first message
    const result = await db.transaction(async (tx) => {
      let finalConversationId = conversationId

      if (isNewConversation) {
        // 1. Create the conversation
        const [newConversation] = await tx
          .insert(conversations)
          .values({
            id: finalConversationId,
            isGroup: isGroup,
            name: isGroup ? 'Group Chat' : null, // TODO: Allow setting group name
          })
          .returning({ id: conversations.id })

        finalConversationId = newConversation.id

        // 2. Add participants
        const participantValues = allParticipantIds.map((userId) => ({
          id: uuidv4(),
          conversationId: finalConversationId,
          userId: userId,
          lastReadAt: userId === currentUser.id ? new Date() : null, // Mark creator's as read initially
        }))
        await tx.insert(conversationParticipants).values(participantValues)
      }

      // 3. Add the initial message
      const [newMessage] = await tx
        .insert(messages)
        .values({
          id: uuidv4(),
          conversationId: finalConversationId,
          senderId: currentUser.id,
          content: validatedInitialMessage,
          contentType: 'TEXT',
        })
        .returning()

      return { conversationId: finalConversationId, message: newMessage }
    })

    revalidatePath('/messages')
    revalidatePath(`/messages/${result.conversationId}`)

    return { success: true, ...result }
  } catch (error) {
    console.error('Error creating conversation:', error)
    return { error: 'Failed to create conversation.' }
  }
}

/**
 * Marks a conversation as read for the current user.
 * @param conversationId
 */
export async function markConversationAsRead(conversationId: string) {
  const validatedConversationId = ConversationIdSchema.parse(conversationId)
  const currentUser = await getCurrentUser()

  try {
    // Update last read time for the current user
    await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, validatedConversationId),
          eq(conversationParticipants.userId, currentUser.id)
        )
      )

    return { success: true }
  } catch (error) {
    console.error('Error marking conversation as read:', error)
    return { error: 'Failed to mark conversation as read.' }
  }
}
