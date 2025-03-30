'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getConversations } from '@/actions/messaging'
import { formatDistanceToNow } from 'date-fns'
import { createBrowserClient } from '@/lib/supabase'
import { MessageCirclePlus } from 'lucide-react'

interface Conversation {
  id: string
  name: string
  isGroup: boolean
  participants: {
    id: string
    name: string | null
    image: string | null
  }[]
  latestMessage: {
    content: string
    createdAt: Date
    isOwn: boolean
  } | null
  updatedAt: Date
  unreadCount: number
}

export function ConversationList({
  initialConversations,
  userId,
}: ConversationListProps) {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router = useRouter()

  // Initialize Supabase client
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const initSupabase = async () => {
      const client = await createBrowserClient()
      setSupabase(client)
    }

    initSupabase()
  }, [])

  // Function to load conversations
  const loadConversations = async () => {
    try {
      setLoading(true)
      const { conversations: convos, error } = await getConversations()
      if (error) {
        console.error('Error loading conversations:', error)
        return
      }

      if (convos) {
        setConversations(convos)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load conversations on component mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId || !supabase) return

    // Your existing supabase subscription logic
    // ... existing code ...

    return () => {
      if (supabase) {
        supabase.removeChannel(conversationsSubscription)
      }
    }
  }, [userId, supabase])

  const handleSelectConversation = (id: string) => {
    setSelectedId(id)
    router.push(`/messages/${id}`)
  }

  const handleNewConversation = () => {
    router.push('/messages/new')
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <Button variant="outline" size="icon" disabled>
            <MessageCirclePlus className="h-4 w-4" />
          </Button>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-md">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Messages</h2>
        <Button
          onClick={handleNewConversation}
          variant="outline"
          size="icon"
          title="New message"
        >
          <MessageCirclePlus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer ${
                selectedId === conversation.id ? 'bg-muted' : ''
              }`}
              onClick={() => handleSelectConversation(conversation.id)}
            >
              {conversation.isGroup ? (
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {conversation.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={conversation.participants[0]?.image || undefined}
                    alt={conversation.name}
                  />
                  <AvatarFallback>
                    {conversation.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="font-medium truncate">
                    {conversation.name}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {conversation.updatedAt &&
                      formatDistanceToNow(new Date(conversation.updatedAt), {
                        addSuffix: true,
                      })}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground truncate">
                  {conversation.latestMessage
                    ? `${conversation.latestMessage.isOwn ? 'You: ' : ''}${
                        conversation.latestMessage.content
                      }`
                    : 'No messages yet'}
                </p>
              </div>

              {conversation.unreadCount > 0 && (
                <Badge variant="default" className="ml-auto text-xs">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  )
}
