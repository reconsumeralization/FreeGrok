"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useUser } from "@/contexts/user-context"
import { Loader2, Search, UserPlus, Check } from "lucide-react"
import Image from "next/image"

interface ConnectionSuggestion {
  id: string
  name: string
  jobTitle: string
  company: string
  profilePicture?: string
  isConnected: boolean
}

interface ConnectionsFormProps {
  onComplete: () => void
}

export function ConnectionsForm({ onComplete }: ConnectionsFormProps) {
  const { user, updateProfile } = useUser()
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])

  // Fetch connection suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true)

      try {
        // In a real app, this would be an API call
        // For this example, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockSuggestions: ConnectionSuggestion[] = [
          {
            id: "1",
            name: "Sarah Johnson",
            jobTitle: "Marketing Director",
            company: "Global Innovations",
            profilePicture: "/placeholder.svg?height=100&width=100",
            isConnected: false,
          },
          {
            id: "2",
            name: "Michael Chen",
            jobTitle: "CTO",
            company: "Tech Solutions Inc.",
            profilePicture: "/placeholder.svg?height=100&width=100",
            isConnected: false,
          },
          {
            id: "3",
            name: "Jessica Williams",
            jobTitle: "VP of Sales",
            company: "Enterprise Systems",
            profilePicture: "/placeholder.svg?height=100&width=100",
            isConnected: false,
          },
          {
            id: "4",
            name: "David Rodriguez",
            jobTitle: "Product Manager",
            company: "Innovative Products",
            profilePicture: "/placeholder.svg?height=100&width=100",
            isConnected: false,
          },
          {
            id: "5",
            name: "Emily Thompson",
            jobTitle: "CEO",
            company: "Strategic Partners",
            profilePicture: "/placeholder.svg?height=100&width=100",
            isConnected: false,
          },
        ]

        setSuggestions(mockSuggestions)
      } catch (error) {
        console.error("Error fetching connection suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [])

  // Filter suggestions based on search query
  const filteredSuggestions = searchQuery
    ? suggestions.filter(
        (suggestion) =>
          suggestion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          suggestion.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          suggestion.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : suggestions

  const handleToggleConnection = (id: string) => {
    setSelectedConnections((prev) => (prev.includes(id) ? prev.filter((connId) => connId !== id) : [...prev, id]))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // In a real app, this would send connection requests
      // For this example, we'll just update the profile completion
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await updateProfile({
        profileCompletion: 100, // Mark profile as complete
      })

      onComplete()
    } catch (error) {
      console.error("Error sending connection requests:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, company, or job title"
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Suggested Connections</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSuggestions.length > 0 ? (
          <div className="space-y-3">
            {filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={suggestion.profilePicture || "/placeholder.svg?height=100&width=100"}
                          alt={suggestion.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{suggestion.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.jobTitle} at {suggestion.company}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={selectedConnections.includes(suggestion.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleConnection(suggestion.id)}
                    >
                      {selectedConnections.includes(suggestion.id) ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No matching connections found</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onComplete}>
          Skip for now
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Finish"
          )}
        </Button>
      </div>
    </div>
  )
}

