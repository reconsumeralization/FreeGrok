"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useServiceCredentials } from "@/hooks/use-service-credentials"

interface SuggestedUser {
  id: string
  name: string
  image: string | null
  title: string | null
  company: string | null
  mutualConnections: number
}

interface SuggestedConnectionsProps {
  userId: string
}

export function SuggestedConnections({ userId }: SuggestedConnectionsProps) {
  const { toast } = useToast()
  const { requestCredentials } = useServiceCredentials()
  const [isLoading, setIsLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([])

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        await requestCredentials("database")

        // In a real app, you would fetch suggestions from an API
        // For now, we'll use mock data
        setTimeout(() => {
          setSuggestions([
            {
              id: "user-2",
              name: "Jane Smith",
              image: "/placeholder.svg?height=200&width=200",
              title: "Marketing Director",
              company: "Global Marketing Inc.",
              mutualConnections: 12,
            },
            {
              id: "user-3",
              name: "Robert Johnson",
              image: "/placeholder.svg?height=200&width=200",
              title: "Software Engineer",
              company: "Tech Solutions Ltd.",
              mutualConnections: 8,
            },
            {
              id: "user-4",
              name: "Emily Davis",
              image: "/placeholder.svg?height=200&width=200",
              title: "Product Manager",
              company: "Innovative Products Co.",
              mutualConnections: 5,
            },
            {
              id: "user-5",
              name: "Michael Wilson",
              image: "/placeholder.svg?height=200&width=200",
              title: "Sales Director",
              company: "Enterprise Sales Inc.",
              mutualConnections: 3,
            },
          ])
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load suggestions. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [requestCredentials, toast])

  const handleConnect = async (suggestedUserId: string) => {
    try {
      await requestCredentials("database")

      // In a real app, you would call an API to send a connection request
      setSuggestions(suggestions.filter((suggestion) => suggestion.id !== suggestedUserId))

      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading suggestions...</p>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No connection suggestions available.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {suggestions.map((suggestion) => (
        <Card key={suggestion.id}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-20 w-20 rounded-full overflow-hidden mb-3">
                {suggestion.image ? (
                  <Image
                    src={suggestion.image || "/placeholder.svg"}
                    alt={suggestion.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <span className="text-2xl font-semibold text-primary">{suggestion.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              <Link href={`/profile/${suggestion.id}`} className="font-medium hover:underline">
                {suggestion.name}
              </Link>

              {suggestion.title && <p className="text-sm text-muted-foreground mt-1">{suggestion.title}</p>}

              {suggestion.company && <p className="text-xs text-muted-foreground">{suggestion.company}</p>}

              <p className="text-xs text-muted-foreground mt-2">
                {suggestion.mutualConnections} mutual connection{suggestion.mutualConnections !== 1 && "s"}
              </p>
            </div>

            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => handleConnect(suggestion.id)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

