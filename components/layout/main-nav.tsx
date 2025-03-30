"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { UserNav } from "@/components/layout/user-nav"
import { Home, Users, MessageSquare, Briefcase, Calendar } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/feed",
      label: "Home",
      icon: Home,
      active: pathname === "/feed",
    },
    {
      href: "/connections",
      label: "Network",
      icon: Users,
      active: pathname === "/connections",
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageSquare,
      active: pathname === "/messages",
    },
    {
      href: "/jobs",
      label: "Jobs",
      icon: Briefcase,
      active: pathname === "/jobs",
    },
    {
      href: "/events",
      label: "Events",
      icon: Calendar,
      active: pathname === "/events",
    },
  ]

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <div className="hidden md:flex items-center space-x-1">
        {routes.map((route) => (
          <Button key={route.href} variant={route.active ? "default" : "ghost"} asChild>
            <Link
              href={route.href}
              className={cn(
                "flex items-center px-3",
                route.active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <route.icon className="h-5 w-5 mr-2" />
              {route.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <NotificationsDropdown />
        <UserNav />
      </div>
    </div>
  )
}

