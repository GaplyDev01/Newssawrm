"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchHistory } from "@/components/search/search-history"

const MAX_HISTORY_ITEMS = 5
const SEARCH_HISTORY_KEY = "search_history"

interface SearchFormProps {
  initialQuery?: string
}

export function SearchForm({ initialQuery = "" }: SearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)

  // Save search to history when initialQuery changes
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      // Get existing history
      const historyJson = localStorage.getItem(SEARCH_HISTORY_KEY)
      let history: string[] = historyJson ? JSON.parse(historyJson) : []

      // Remove the query if it already exists (to avoid duplicates)
      history = history.filter((item) => item !== initialQuery)

      // Add the new query to the beginning
      history.unshift(initialQuery)

      // Limit the history size
      if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS)
      }

      // Save back to localStorage
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    }
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    const params = new URLSearchParams()
    params.set("query", query)
    router.push(`/search?${params.toString()}`)

    // We don't need to set isSearching to false here because the page will reload
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="w-full">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for articles, topics, or concepts..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSearching || !query.trim()}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      <SearchHistory />
    </div>
  )
}
