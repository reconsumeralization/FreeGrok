import type { Metadata } from "next"
import { NotificationsList } from "@/components/notifications/notifications-list"

export const metadata: Metadata = {
  title: "Notifications | B2B Network",
  description: "View your notifications and stay updated with your network activity.",
}

export default function NotificationsPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <NotificationsList />
    </div>
  )
}

