"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    // Navigate to search page with query
    router.push(`/search?query=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSearch} className="relative w-64">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search news..."
        className="pl-8"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  )
}
