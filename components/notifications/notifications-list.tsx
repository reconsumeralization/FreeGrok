"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
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

export function NotificationsList() {
  const { toast } = useToast()
  const { requestCredentials } = useServiceCredentials()
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])

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
            {
              id: "notif-4",
              userId: "user-1",
              type: "CONNECTION_ACCEPTED",
              actorId: "user-5",
              entityId: "conn-2",
              entityType: "CONNECTION",
              message: "accepted your connection request",
              isRead: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
              actorName: "Michael Wilson",
              actorImage: "/placeholder.svg?height=200&width=200",
            },
            {
              id: "notif-5",
              userId: "user-1",
              type: "MENTION",
              actorId: "user-6",
              entityId: "post-3",
              entityType: "POST",
              message: "mentioned you in a post",
              isRead: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
              actorName: "Sarah Brown",
              actorImage: "/placeholder.svg?height=200&width=200",
            },
          ]

          setNotifications(mockNotifications)
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

  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const readNotifications = notifications.filter((n) => n.isRead)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          {unreadNotifications.length > 0 && (
            <p className="text-sm text-muted-foreground">
              You have {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 && "s"}.
            </p>
          )}
        </div>

        {unreadNotifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">
            All
            <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              {notifications.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadNotifications.length > 0 && (
              <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                {unreadNotifications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderNotificationsList(notifications)}</TabsContent>

        <TabsContent value="unread">
          {unreadNotifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No unread notifications.</p>
            </div>
          ) : (
            renderNotificationsList(unreadNotifications)
          )}
        </TabsContent>

        <TabsContent value="read">
          {readNotifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No read notifications.</p>
            </div>
          ) : (
            renderNotificationsList(readNotifications)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderNotificationsList(notificationsList: Notification[]) {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      )
    }

    if (notificationsList.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No notifications.</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {notificationsList.map((notification) => (
          <Card key={notification.id} className={!notification.isRead ? "bg-primary/5" : undefined}>
            <CardContent className="p-4">
              <Link
                href={getNotificationLink(notification)}
                className="flex items-start"
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
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
                  <p>
                    <span className="font-medium">{notification.actorName}</span> {notification.message}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                  </p>
                </div>

                {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}

