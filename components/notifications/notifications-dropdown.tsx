"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useServiceCredentials } from "@/hooks/use-service-credentials"

interface Notification {
  id: string
  userId: string
  type: string
  actorId: string | null
  entityId: string | null
  entityType: string | null
  message: string
  isRead: boolean
  createdAt: Date
  actorName: string | null
  actorImage: string | null
}

export function NotificationsDropdown() {
  const { toast } = useToast()
  const { requestCredentials } = useServiceCredentials()
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        await requestCredentials("database")

        // In a real app, you would fetch notifications from an API
        // For now, we'll use mock data
        setTimeout(() => {
          const mockNotifications = [
            {
              id: "notif-1",
              userId: "user-1",
              type: "CONNECTION_REQUEST",
              actorId: "user-2",
              entityId: "conn-1",
              entityType: "CONNECTION",
              message: "sent you a connection request",
              isRead: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
              actorName: "Jane Smith",
              actorImage: "/placeholder.svg?height=200&width=200",
            },
            {
              id: "notif-2",
              userId: "user-1",
              type: "POST_LIKE",
              actorId: "user-3",
              entityId: "post-1",
              entityType: "POST",
              message: "liked your post",
              isRead: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
              actorName: "Robert Johnson",
              actorImage: "/placeholder.svg?height=200&width=200",
            },
            {
              id: "notif-3",
              userId: "user-1",
              type: "POST_COMMENT",
              actorId: "user-4",
              entityId: "post-2",
              entityType: "POST",
              message: "commented on your post",
              isRead: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
              actorName: "Emily Davis",
              actorImage: "/placeholder.svg?height=200&width=200",
            },
          ]

          setNotifications(mockNotifications)
          setUnreadCount(mockNotifications.filter((n) => !n.isRead).length)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [requestCredentials, toast])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await requestCredentials("database")

      // In a real app, you would call an API to mark the notification as read
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification,
        ),
      )

      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await requestCredentials("database")

      // In a real app, you would call an API to mark all notifications as read
      setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
      setUnreadCount(0)

      toast({
        title: "Notifications marked as read",
        description: "All notifications have been marked as read.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getNotificationLink = (notification: Notification) => {
    switch (notification.entityType) {
      case "CONNECTION":
        return "/connections"
      case "POST":
        return `/feed/post/${notification.entityId}`
      default:
        return "#"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center translate-x-1/4 -translate-y-1/4">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start p-3 cursor-pointer ${!notification.isRead ? "bg-primary/5" : ""}`}
                onClick={() => handleMarkAsRead(notification.id)}
                asChild
              >
                <Link href={getNotificationLink(notification)}>
                  <div className="flex items-start">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden mr-3 flex-shrink-0">
                      {notification.actorImage ? (
                        <Image
                          src={notification.actorImage || "/placeholder.svg"}
                          alt={notification.actorName || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10">
                          <span className="text-sm font-semibold text-primary">
                            {notification.actorName?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{notification.actorName}</span> {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                    </div>

                    {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-sm">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

