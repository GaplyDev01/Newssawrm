"use client"
import { usePathname, useRouter } from "next/navigation"
import { User, Bell, Globe, Shield, HelpCircle, BarChart2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function SettingsSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const sections = [
    {
      id: "account",
      label: "Account",
      icon: User,
      path: "/settings",
    },
    {
      id: "impact-factors",
      label: "Impact Factors",
      icon: BarChart2,
      path: "/settings/impact-factors",
    },
    {
      id: "ai-recommendations",
      label: "AI Recommendations",
      icon: Sparkles,
      path: "/settings/ai-recommendations",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/settings/notifications",
    },
    {
      id: "feed-preferences",
      label: "Feed Preferences",
      icon: Globe,
      path: "/settings/feed-preferences",
    },
    {
      id: "privacy-security",
      label: "Privacy & Security",
      icon: Shield,
      path: "/settings/privacy-security",
    },
    {
      id: "help-support",
      label: "Help & Support",
      icon: HelpCircle,
      path: "/settings/help-support",
    },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="w-64 border-r overflow-auto">
      <nav className="p-4">
        {sections.map((section) => (
          <button
            key={section.id}
            className={cn(
              "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-left transition-colors",
              pathname === section.path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
            )}
            onClick={() => handleNavigation(section.path)}
          >
            <section.icon className="h-5 w-5" />
            {section.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
