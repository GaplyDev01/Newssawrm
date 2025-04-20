"use server"

import { vectorSearch } from "@/lib/vector-search"
import { logErrorEvent, logInfoEvent } from "@/lib/error-logger"

/**
 * Server action to search for articles based on a query string
 */
export async function searchArticles(query: string, limit = 10) {
  try {
    if (!query.trim()) {
      return []
    }

    // Log the search query
    await logInfoEvent("Search performed", "searchArticles", {
      query,
      requestedLimit: limit,
    })

    // Use the vector search functionality
    const results = await vectorSearch(query, {
      limit,
      maxResults: Math.max(20, limit * 2), // Fetch more results than needed to allow for filtering
    })

    return results
  } catch (error) {
    await logErrorEvent("Error in search", "searchArticles", error, { query, limit })
    console.error("Search error:", error)
    return []
  }
}
