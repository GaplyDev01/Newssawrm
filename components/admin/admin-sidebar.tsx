"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Settings, Users, Newspaper, Bell, Search, AlertTriangle, Database } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LogoutButton } from "@/components/auth/logout-button"

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const routes = [
    {
      title: "Dashboard",
      icon: BarChart,
      href: "/admin",
      variant: "default",
    },
    {
      title: "Articles",
      icon: Newspaper,
      href: "/admin/articles",
      variant: "ghost",
    },
    {
      title: "Users",
      icon: Users,
      href: "/admin/users",
      variant: "ghost",
    },
    {
      title: "Alerts",
      icon: Bell,
      href: "/admin/alerts",
      variant: "ghost",
    },
    {
      title: "Search",
      icon: Search,
      href: "/admin/search",
      variant: "ghost",
    },
    {
      title: "Analytics",
      icon: BarChart,
      href: "/admin/analytics",
      variant: "ghost",
    },
    {
      title: "Embeddings",
      icon: Database,
      href: "/admin/embeddings",
      variant: "ghost",
    },
    {
      title: "Error Logs",
      icon: AlertTriangle,
      href: "/admin/errors",
      variant: "ghost",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/admin/settings",
      variant: "ghost",
    },
  ]

  return (
    <div className={cn("relative flex flex-col border-r bg-background", isCollapsed ? "w-16" : "w-64")}>
      <div className="flex h-14 items-center px-4 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <BarChart className="h-6 w-6" />
          {!isCollapsed && <span className="font-bold">Admin Dashboard</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-3"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route, i) => (
            <Link
              key={i}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === route.href ? "bg-accent text-accent-foreground" : "transparent",
                isCollapsed && "justify-center px-0",
              )}
            >
              <route.icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>{route.title}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4">
        <LogoutButton variant="outline" size="sm" className={cn("w-full", isCollapsed && "h-10 w-10 p-0")}>
          {isCollapsed ? null : "Logout"}
        </LogoutButton>
      </div>
    </div>
  )
}
