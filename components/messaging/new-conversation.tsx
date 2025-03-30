'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageComposer } from '@/components/messaging/message-composer'
import { Label } from '@/components/ui/label'
import { createConversation } from '@/actions/messaging'
import { getConnections } from '@/actions/connections'
import { Loader2, Users, Search, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Connection {
  id: string
  userId: string
  name: string
  image: string | null
}

export function NewConversation() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Connection[]>([])
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Load user connections
  useEffect(() => {
    const loadConnections = async () => {
      try {
        setLoading(true)
        const { connections: userConnections } = await getConnections()

        if (userConnections) {
          setConnections(userConnections)
        }
      } catch (error) {
        console.error('Failed to load connections:', error)
        toast({
          title: 'Error Loading Connections',
          description: 'Could not load your connections. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadConnections()
  }, [toast])

  // Filtered connections based on search term
  const filteredConnections = connections.filter((connection) =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectUser = (user: Connection) => {
    // Check if the user is already selected
    if (!selectedUsers.some((u) => u.userId === user.userId)) {
      setSelectedUsers([...selectedUsers, user])
    }

    // Clear search after selecting
    setSearchTerm('')
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.userId !== userId))
  }

  const handleStartConversation = async (initialMessage: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No Recipients Selected',
        description: 'Please select at least one recipient for your message.',
        variant: 'destructive',
      })
      return
    }

    if (isGroup && !groupName.trim()) {
      toast({
        title: 'Group Name Required',
        description: 'Please provide a name for the group conversation.',
        variant: 'destructive',
      })
      return
    }

    try {
      const { conversationId, error } = await createConversation(
        selectedUsers.map((user) => user.userId),
        initialMessage,
        isGroup ? groupName : undefined
      )

      if (error) {
        toast({
          title: 'Conversation Error',
          description: error,
          variant: 'destructive',
        })
        return
      }

      if (conversationId) {
        toast({
          title: 'Conversation Started',
          description: `Your message has been sent.`,
        })

        // Navigate to the new conversation
        router.push(`/messages/${conversationId}`)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: 'Conversation Error',
        description: 'Failed to start the conversation. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-4">New Message</h2>

        <div className="space-y-4">
          {/* Group toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="group-chat"
              checked={isGroup}
              onCheckedChange={(checked) => setIsGroup(!!checked)}
            />
            <Label htmlFor="group-chat" className="cursor-pointer">
              Create group conversation
            </Label>
          </div>

          {/* Group name input (if group) */}
          {isGroup && (
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          )}

          {/* Search and select recipients */}
          <div className="space-y-2">
            <Label>
              To:{' '}
              {selectedUsers.length > 0 && `(${selectedUsers.length} selected)`}
            </Label>

            <div className="flex items-center gap-2 border rounded-md p-2 min-h-10">
              {/* Selected user pills */}
              {selectedUsers.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-sm"
                >
                  <span>{user.name}</span>
                  <button
                    onClick={() => handleRemoveUser(user.userId)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${user.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Search input */}
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for connections..."
                className="border-0 flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
            </div>
          </div>

          {/* Search results */}
          {searchTerm.length > 0 && (
            <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading connections...
                  </p>
                </div>
              ) : filteredConnections.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No matches found
                </div>
              ) : (
                filteredConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleSelectUser(connection)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={connection.image || undefined}
                        alt={connection.name}
                      />
                      <AvatarFallback>
                        {connection.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{connection.name}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conversation composer */}
      <div className="flex-1 flex flex-col justify-end">
        <MessageComposer
          recipientId="new"
          recipientName={
            selectedUsers.length === 0
              ? 'your connections'
              : selectedUsers.length === 1
              ? selectedUsers[0].name
              : `${selectedUsers.length} recipients`
          }
          onMessageSent={handleStartConversation}
        />
      </div>
    </div>
  )
}
