"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useUser, ProfileStage } from "@/contexts/user-context"
import { useCredentials } from "@/contexts/credentials-context"
import { Loader2, UserPlus, Check, X } from "lucide-react"
import Image from "next/image"
import { FeatureGate } from "@/components/feature-gate"

interface ConnectionRequestProps {
  userId: string
  name: string
  jobTitle?: string
  company?: string
  profilePicture?: string
  mutualConnections?: number
}

export function ConnectionRequest({
  userId,
  name,
  jobTitle,
  company,
  profilePicture,
  mutualConnections = 0,
}: ConnectionRequestProps) {
  const [status, setStatus] = useState<"none" | "pending" | "connected">("none")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { promptForProfileCompletion } = useUser()
  const { requestCredential } = useCredentials()

  const handleConnect = async () => {
    // Check if the user has completed the required profile stage
    const canProceed = await promptForProfileCompletion(ProfileStage.PERSONAL)
    if (!canProceed) return

    setIsLoading(true)

    try {
      // In a real app, this would be an API call to send a connection request
      // For this example, we'll just simulate it
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if we need LinkedIn API credentials for enhanced connection features
      if (mutualConnections > 5) {
        try {
          // Only request LinkedIn credentials if we have many mutual connections
          // This demonstrates contextual credential requests
          await requestCredential("LINKEDIN_CLIENT_ID", "enhance your connection experience with LinkedIn integration")

          await requestCredential("LINKEDIN_CLIENT_SECRET", "complete LinkedIn integration for enhanced connections")

          toast({
            title: "LinkedIn Integration Enabled",
            description: "Your connections will now be synchronized with LinkedIn.",
          })
        } catch (error) {
          // User declined to provide LinkedIn credentials
          // We can still proceed with the basic connection request
          console.log("User declined LinkedIn integration")
        }
      }

      setStatus("pending")

      toast({
        title: "Connection Request Sent",
        description: `Your connection request to ${name} has been sent.`,
      })
    } catch (error) {
      console.error("Error sending connection request:", error)
      toast({
        title: "Request Failed",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async () => {
    setIsLoading(true)

    try {
      // In a real app, this would be an API call to accept a connection request
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStatus("connected")

      toast({
        title: "Connection Accepted",
        description: `You are now connected with ${name}.`,
      })
    } catch (error) {
      console.error("Error accepting connection request:", error)
      toast({
        title: "Action Failed",
        description: "Failed to accept connection request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleIgnore = async () => {
    setIsLoading(true)

    try {
      // In a real app, this would be an API call to ignore a connection request
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStatus("none")

      toast({
        title: "Request Ignored",
        description: `Connection request from ${name} has been ignored.`,
      })
    } catch (error) {
      console.error("Error ignoring connection request:", error)
      toast({
        title: "Action Failed",
        description: "Failed to ignore connection request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FeatureGate requiredStage={ProfileStage.PERSONAL}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image
                  src={profilePicture || "/placeholder.svg?height=100&width=100"}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">{name}</h4>
                {(jobTitle || company) && (
                  <p className="text-sm text-muted-foreground">
                    {jobTitle}
                    {company ? ` at ${company}` : ""}
                  </p>
                )}
                {mutualConnections > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {mutualConnections} mutual connection{mutualConnections !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {status === "none" ? (
                <Button size="sm" onClick={handleConnect} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Connect
                    </>
                  )}
                </Button>
              ) : status === "pending" ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleIgnore} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Ignore
                      </>
                    )}
                  </Button>
                  <Button size="sm" onClick={handleAccept} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" disabled>
                  <Check className="h-4 w-4 mr-1" />
                  Connected
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </FeatureGate>
  )
}

