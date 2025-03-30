"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  getConnectionSuggestions,
  type ConnectionSuggestion,
  sendConnectionRequest,
} from "@/lib/services/collaboration-service"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/components/ui/use-toast"
import { Users, UserPlus, Building, Check, Loader2 } from "lucide-react"
import Link from "next/link"

export function ConnectionSuggestions() {
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingConnections, setPendingConnections] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!user?.id) return

      setIsLoading(true)
      try {
        const items = await getConnectionSuggestions(user.id, 3)
        setSuggestions(items)
      } catch (error) {
        console.error("Error loading connection suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      loadSuggestions()
    }
  }, [user])

  const handleConnect = async (suggestion: ConnectionSuggestion) => {
    if (!user?.id || isSubmitting) return

    setIsSubmitting(true)

    try {
      await sendConnectionRequest(
        user.id,
        suggestion.userId,
        `Hello ${suggestion.name}, I'd like to connect with you on BizConnect.`,
      )

      // Update UI
      setPendingConnections((prev) => new Set(prev).add(suggestion.userId))

      toast({
        title: "Connection request sent",
        description: `Your connection request to ${suggestion.name} has been sent.`,
      })
    } catch (error) {
      console.error("Error sending connection request:", error)
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <Users className="h-4 w-4 mr-2" />
          People You May Know
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No suggestions found</p>
            <p className="text-xs text-muted-foreground mt-1">Complete your profile to find relevant connections</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.userId} className="flex gap-3">
                <Avatar>
                  <AvatarImage
                    src={suggestion.profileImage || "/placeholder.svg?height=40&width=40"}
                    alt={suggestion.name}
                  />
                  <AvatarFallback>{suggestion.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link href={`/profile/${suggestion.userId}`} className="font-medium text-sm hover:underline">
                    {suggestion.name}
                  </Link>
                  {(suggestion.role || suggestion.company) && (
                    <p className="text-xs text-muted-foreground">
                      {suggestion.role}
                      {suggestion.company ? ` at ${suggestion.company}` : ""}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{suggestion.connectionReason}</p>
                  {suggestion.industry && (
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Building className="h-3 w-3 mr-1" />
                      {suggestion.industry}
                    </div>
                  )}
                </div>
                <div>
                  {pendingConnections.has(suggestion.userId) ? (
                    <Button variant="outline" size="sm" disabled>
                      <Check className="h-4 w-4 mr-1" />
                      Pending
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleConnect(suggestion)} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link href="/network">Find more connections</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

