"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Notification {
  id: string
  type: string
  content: string
  link?: string
  isRead: boolean
  createdAt: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  useEffect(() => {
    // Fetch unread count on initial load
    fetchUnreadCount()

    // Set up polling for unread count
    const interval = setInterval(fetchUnreadCount, 60000) // Poll every minute

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/notifications")

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error("Fetch notifications error:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread-count")

      if (!response.ok) {
        throw new Error("Failed to fetch unread count")
      }

      const data = await response.json()
      setUnreadCount(data.count)
    } catch (error) {
      console.error("Fetch unread count error:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
      )

      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Mark as read error:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }

      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))

      setUnreadCount(0)

      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Mark all as read error:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) {
      return "Just now"
    } else if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 -translate-y-1/3 translate-x-1/3 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 ${!notification.isRead ? "bg-muted/50" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={notification.link || "#"}
                        className="text-sm"
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id)
                          }
                        }}
                      >
                        {notification.content}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatNotificationTime(notification.createdAt)}</p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Bell className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No notifications</p>
                <p className="text-xs text-muted-foreground">You're all caught up!</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="unread" className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.filter((n) => !n.isRead).length > 0 ? (
              <div className="divide-y">
                {notifications
                  .filter((n) => !n.isRead)
                  .map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 p-3 bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={notification.link || "#"}
                          className="text-sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          {notification.content}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Bell className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No unread notifications</p>
                <p className="text-xs text-muted-foreground">You're all caught up!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <div className="border-t p-2">
          <Link href="/notifications" className="block rounded-md p-2 text-center text-sm text-primary hover:bg-muted">
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

