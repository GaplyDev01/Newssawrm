"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Home, Bookmark, TrendingUp, Bell, Settings, LogOut, Zap, Search, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase-client"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

          setIsAdmin(profile?.role === "admin")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
    router.refresh()
  }

  const routes = [
    {
      label: "News Feed",
      icon: Home,
      href: "/feed",
      active: pathname === "/feed",
    },
    {
      label: "Search",
      icon: Search,
      href: "/search",
      active: pathname === "/search" || pathname.startsWith("/search?"),
    },
    {
      label: "Saved Articles",
      icon: Bookmark,
      href: "/saved",
      active: pathname === "/saved",
    },
    {
      label: "Crypto News",
      icon: TrendingUp,
      href: "/crypto",
      active: pathname === "/crypto",
    },
    {
      label: "Alerts",
      icon: Bell,
      href: "/alerts",
      active: pathname === "/alerts",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  // Add admin dashboard link for admin users
  if (isAdmin) {
    routes.push({
      label: "Admin Dashboard",
      icon: Shield,
      href: "/admin",
      active: pathname.startsWith("/admin"),
    })
  }

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/feed" className="flex items-center gap-2 font-semibold">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl">CryptoIntel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                route.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
