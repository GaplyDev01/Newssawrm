"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function RefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      // Trigger news processing
      await fetch("/api/news/process")

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error refreshing news:", error)
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
