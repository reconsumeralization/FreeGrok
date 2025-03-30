"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Search, UserMinus, Grid3X3, List } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useServiceCredentials } from "@/hooks/use-service-credentials"

interface Connection {
  id: string
  userId: string
  connectedUserId: string
  status: string
  name: string
  image: string | null
  title: string | null
  company: string | null
}

interface ConnectionsListProps {
  connections: Connection[]
}

export function ConnectionsList({ connections: initialConnections }: ConnectionsListProps) {
  const { toast } = useToast()
  const { requestCredentials } = useServiceCredentials()
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredConnections = connections.filter(
    (connection) =>
      connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (connection.title && connection.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (connection.company && connection.company.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleRemoveConnection = async (connectionId: string) => {
    try {
      await requestCredentials("database")

      // In a real app, you would call an API to remove the connection
      setConnections(connections.filter((connection) => connection.id !== connectionId))

      toast({
        title: "Connection removed",
        description: "The connection has been removed from your network.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove connection. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMessage = async (userId: string) => {
    try {
      await requestCredentials("database")

      toast({
        title: "Message initiated",
        description: "You can now message this connection.",
      })

      // In a real app, you would navigate to the messages page or open a message modal
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate message. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredConnections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No connections found.</p>
          {searchQuery && <p className="text-sm text-muted-foreground mt-2">Try adjusting your search query.</p>}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredConnections.map((connection) => (
            <Card key={connection.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative h-20 w-20 rounded-full overflow-hidden mb-3">
                      {connection.image ? (
                        <Image
                          src={connection.image || "/placeholder.svg"}
                          alt={connection.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10">
                          <span className="text-2xl font-semibold text-primary">{connection.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    <Link href={`/profile/${connection.connectedUserId}`} className="font-medium hover:underline">
                      {connection.name}
                    </Link>

                    {connection.title && <p className="text-sm text-muted-foreground mt-1">{connection.title}</p>}

                    {connection.company && <p className="text-xs text-muted-foreground">{connection.company}</p>}
                  </div>

                  <div className="flex justify-center gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleMessage(connection.connectedUserId)}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleRemoveConnection(connection.id)}>
                      <UserMinus className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConnections.map((connection) => (
            <Card key={connection.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                      {connection.image ? (
                        <Image
                          src={connection.image || "/placeholder.svg"}
                          alt={connection.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10">
                          <span className="text-lg font-semibold text-primary">{connection.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Link href={`/profile/${connection.connectedUserId}`} className="font-medium hover:underline">
                        {connection.name}
                      </Link>

                      {connection.title && (
                        <p className="text-sm text-muted-foreground">
                          {connection.title}
                          {connection.company && ` at ${connection.company}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleMessage(connection.connectedUserId)}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Message</span>
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => handleRemoveConnection(connection.id)}>
                      <UserMinus className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

