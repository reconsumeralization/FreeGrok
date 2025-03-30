'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { usePathname, useRouter } from 'next/navigation'

// Interface definitions
interface Message {
  id: string
  content: string
  sender_id: string
  conversation_id: string
  created_at: string
}

interface Conversation {
  id: string
  title: string
  created_at: string
  last_message_at: string
  participant_ids: string[]
}

interface MessagingProviderProps {
  children: React.ReactNode
  userId?: string
  initialConversations?: Conversation[]
}

export const MessagingProvider = ({
  children,
  userId,
  initialConversations = [],
}: MessagingProviderProps) => {
  const { toast } = useToast()
  const pathname = usePathname()
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

  // Set up real-time listeners for new messages
  useEffect(() => {
    if (!userId) return

    // Only proceed with subscription if supabase is available
    if (!supabase) return

    // Subscribe to INSERT events on messages where the current user is a participant
    const subscription = supabase
      .channel('new_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${userId}`, // Only listen for messages from others
        },
        async (payload: { new: Message }) => {
          const { new: newMessage } = payload

          // Check if the current user is a participant in this conversation
          const { data } = await supabase
            .from('conversation_participants')
            .select('*')
            .eq('conversation_id', newMessage.conversation_id)
            .eq('user_id', userId)
            .single()

          if (data) {
            // Show notification if the user is not currently viewing this conversation
            const isViewingConversation =
              pathname === `/messaging/${newMessage.conversation_id}`

            if (!isViewingConversation) {
              toast({
                title: 'New message',
                description: `You have a new message in conversation ${newMessage.conversation_id}`,
                action: {
                  label: 'View',
                  onClick: () =>
                    router.push(`/messaging/${newMessage.conversation_id}`),
                },
              })
            }

            // Refresh the current page to show the new message if already in conversation
            if (isViewingConversation) {
              router.refresh()
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [userId, toast, pathname, router, supabase])

  return <>{children}</>
}
