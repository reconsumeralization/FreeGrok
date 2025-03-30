"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Edit, MessageSquare, UserPlus, UserCheck, Share2, MoreHorizontal, Camera } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useServiceCredentials } from "@/hooks/use-service-credentials"

interface ProfileHeaderProps {
  user: {
    id: string
    name: string
    title: string
    company: string
    profileImage: string
    coverImage: string
    isCurrentUser: boolean
    isConnected: boolean
    isPending: boolean
  }
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { toast } = useToast()
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: user.isConnected,
    isPending: user.isPending,
  })
  const { requestCredentials } = useServiceCredentials()

  const handleConnect = async () => {
    try {
      await requestCredentials("database")
      setConnectionStatus({ isConnected: false, isPending: true })
      toast({
        title: "Connection request sent",
        description: `Your connection request to ${user.name} has been sent.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMessage = async () => {
    try {
      await requestCredentials("database")
      toast({
        title: "Message initiated",
        description: `You can now message ${user.name}.`,
      })
      // Navigate to messages or open message modal
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Profile link copied",
      description: "The profile link has been copied to your clipboard.",
    })
  }

  return (
    <div className="relative mb-8">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 md:h-80 w-full bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-b-lg overflow-hidden">
        {user.coverImage && (
          <Image
            src={user.coverImage || "/placeholder.svg"}
            alt={`${user.name}'s cover`}
            fill
            className="object-cover"
            priority
          />
        )}
        {user.isCurrentUser && (
          <Button size="sm" variant="secondary" className="absolute top-4 right-4 flex items-center gap-1">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Update Cover</span>
          </Button>
        )}
      </div>

      {/* Profile Image */}
      <div className="absolute -bottom-16 left-4 sm:left-8">
        <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-background overflow-hidden bg-muted">
          {user.profileImage ? (
            <Image
              src={user.profileImage || "/placeholder.svg"}
              alt={user.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/10">
              <span className="text-4xl font-semibold text-primary">{user.name.charAt(0)}</span>
            </div>
          )}
          {user.isCurrentUser && (
            <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8">
              <Camera className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-2 mt-4 mr-4">
        {user.isCurrentUser ? (
          <Button variant="outline" className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        ) : (
          <>
            {connectionStatus.isConnected ? (
              <Button variant="outline" className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                <span>Connected</span>
              </Button>
            ) : connectionStatus.isPending ? (
              <Button variant="outline" disabled className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                <span>Pending</span>
              </Button>
            ) : (
              <Button onClick={handleConnect} className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                <span>Connect</span>
              </Button>
            )}

            <Button variant="outline" onClick={handleMessage} className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Message</span>
            </Button>
          </>
        )}

        <Button variant="outline" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!user.isCurrentUser && <DropdownMenuItem>Report Profile</DropdownMenuItem>}
            <DropdownMenuItem>Save Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>Share Profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

