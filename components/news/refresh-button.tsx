"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function RefreshButton() {
  const router = useRouter()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      // In a real app, this would trigger a refresh of the news feed
      // For now, we'll just simulate a delay and refresh the page
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Feed refreshed",
        description: "Your news feed has been updated with the latest articles",
      })

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error refreshing news:", error)
      toast({
        title: "Error",
        description: "Failed to refresh news feed",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      <span className="sr-only">Refresh</span>
    </Button>
  )
}
