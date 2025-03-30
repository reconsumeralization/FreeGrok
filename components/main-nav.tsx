"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, MessageSquare, Bell, Search, Calendar, BarChart2, Settings, Globe } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/feed",
      label: "Feed",
      icon: Home,
      active: pathname === "/feed",
    },
    {
      href: "/network",
      label: "Network",
      icon: Users,
      active: pathname === "/network" || pathname.startsWith("/network/"),
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageSquare,
      active: pathname === "/messages" || pathname.startsWith("/messages/"),
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
      active: pathname === "/notifications",
    },
    {
      href: "/search",
      label: "Search",
      icon: Search,
      active: pathname === "/search",
    },
    {
      href: "/events",
      label: "Events",
      icon: Calendar,
      active: pathname === "/events" || pathname.startsWith("/events/"),
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: BarChart2,
      active: pathname === "/analytics",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings" || pathname.startsWith("/settings/"),
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/" className="flex items-center mr-6">
        <Globe className="h-6 w-6 text-primary" />
        <span className="ml-2 text-xl font-bold hidden md:block">BizConnect</span>
      </Link>

      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          <route.icon className={cn("h-5 w-5 md:mr-2", route.active ? "text-primary" : "text-muted-foreground")} />
          <span className="hidden md:block">{route.label}</span>
        </Link>
      ))}
    </nav>
  )
}

