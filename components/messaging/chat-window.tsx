'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageComposer } from '@/components/messaging/message-composer'
import { getMessages, sendMessage } from '@/actions/messaging'
import { formatDistanceToNow } from 'date-fns'
import { createBrowserClient } from '@/lib/supabase'

interface Message {
  id: string
  content: string
  createdAt: Date | string
  sender: {
    id: string
    name: string
    image: string | null
  }
}

interface ChatWindowProps {
  conversationId: string
  conversationName: string
  isGroup: boolean
  participants: {
    id: string
    name: string | null
    image: string | null
  }[]
  currentUserId: string
}

export function ChatWindow({
  conversationId,
  conversationName,
  isGroup,
  participants,
  currentUserId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [supabase, setSupabase] = useState<any>(null)

  // Function to load messages
  const loadMessages = async () => {
    try {
      setLoading(true)
      const { messages: chatMessages, error } = await getMessages(
        conversationId
      )

      if (error) {
        setError(error)
        return
      }

      if (chatMessages) {
        setMessages(chatMessages)
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError('Failed to load messages. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load messages on component mount or when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages()
    }
  }, [conversationId])

  // Initialize Supabase client
  useEffect(() => {
    const initSupabase = async () => {
      const client = await createBrowserClient()
      setSupabase(client)
    }

    initSupabase()
  }, [])

  // Set up real-time listeners for new messages
  useEffect(() => {
    if (!conversationId || !supabase) return

    // Subscribe to INSERT events on the messages table for this conversation
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // When a new message comes in, add it to the list
          const newMessage = payload.new as any

          // Prevent duplicates by checking if we already have this message
          if (!messages.some((msg) => msg.id === newMessage.id)) {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: newMessage.id,
                content: newMessage.content,
                createdAt: newMessage.created_at,
                sender: {
                  id: newMessage.sender_id,
                  name:
                    participants.find((p) => p.id === newMessage.sender_id)
                      ?.name || 'Unknown User',
                  image:
                    participants.find((p) => p.id === newMessage.sender_id)
                      ?.image || null,
                },
              },
            ])
          }
        }
      )
      .subscribe()

    return () => {
      // Clean up subscription when component unmounts or conversation changes
      supabase.removeChannel(subscription)
    }
  }, [conversationId, messages, participants, supabase])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    try {
      const { success, error } = await sendMessage(conversationId, content)

      if (error) {
        console.error('Error sending message:', error)
        return
      }

      // We don't need to add the message manually here since the real-time subscription will catch it
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-3">
        {isGroup ? (
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {conversationName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={participants[0]?.image || undefined}
              alt={conversationName}
            />
            <AvatarFallback>
              {conversationName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <h2 className="font-semibold">{conversationName}</h2>
          {isGroup && (
            <p className="text-xs text-muted-foreground">
              {participants.length} members
            </p>
          )}
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="mb-6">
              <div className="text-xs text-center text-muted-foreground mb-4">
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>

              <div className="space-y-4">
                {dateMessages.map((message) => {
                  const isOwnMessage = message.sender.id === currentUserId

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isOwnMessage ? 'justify-end' : 'items-start gap-2'
                      }`}
                    >
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={message.sender.image || undefined}
                            alt={message.sender.name}
                          />
                          <AvatarFallback>
                            {message.sender.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`max-w-[75%] ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        } rounded-lg p-3`}
                      >
                        {!isOwnMessage && (
                          <div className="text-xs font-medium mb-1">
                            {message.sender.name}
                          </div>
                        )}
                        <div className="text-sm">{message.content}</div>
                        <div className="text-[10px] mt-1 opacity-70">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </ScrollArea>

      <MessageComposer
        recipientId={conversationId}
        recipientName={conversationName}
        onMessageSent={handleSendMessage}
      />
    </div>
  )
}
