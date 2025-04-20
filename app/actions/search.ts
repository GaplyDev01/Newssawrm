"use server"
import { makeClient } from "@/lib/serverClient"
import { generateEmbedding } from "@/lib/openai"
import { logErrorEvent, logInfoEvent } from "@/lib/error-logger"

export async function searchArticles(query: string) {
  try {
    const supabase = makeClient()

    // Generate embedding for the search query
    const embedding = await generateEmbedding(query)

    // Use the match_articles function to find similar articles
    const { data, error } = await supabase.rpc("match_articles", {
      query_embedding: embedding,
      match_threshold: 0.5, // Adjust this threshold as needed
      match_count: 10, // Return top 10 results
    })

    if (error) {
      await logErrorEvent("Error searching articles", "searchArticles", error, { query })
      return []
    }

    await logInfoEvent("Search performed", "searchArticles", {
      query,
      resultCount: data?.length || 0,
    })

    return data || []
  } catch (error) {
    await logErrorEvent("Error in searchArticles", "searchArticles", error, { query })
    return []
  }
}
