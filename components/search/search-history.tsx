"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const MAX_HISTORY_ITEMS = 5
const SEARCH_HISTORY_KEY = "search_history"

export function SearchHistory() {
  const router = useRouter()
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  const handleSearchClick = (query: string) => {
    const params = new URLSearchParams()
    params.set("query", query)
    router.push(`/search?${params.toString()}`)
  }

  const handleClearItem = (e: React.MouseEvent, query: string) => {
    e.stopPropagation()
    const newHistory = searchHistory.filter((item) => item !== query)
    setSearchHistory(newHistory)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  }

  const handleClearAll = () => {
    setSearchHistory([])
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  }

  if (searchHistory.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Recent Searches</h3>
        <Button variant="ghost" size="sm" onClick={handleClearAll}>
          Clear All
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searchHistory.map((query) => (
          <div
            key={query}
            className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm cursor-pointer hover:bg-muted/80"
            onClick={() => handleSearchClick(query)}
          >
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{query}</span>
            <X
              className="h-3 w-3 text-muted-foreground hover:text-foreground"
              onClick={(e) => handleClearItem(e, query)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
