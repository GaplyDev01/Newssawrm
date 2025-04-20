import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import type { Database } from "./database.types"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Supabase client (server-side)
const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export type SearchResult = {
  id: string
  title: string
  content: string
  summary: string | null
  published_at: string | null
  url: string | null
  image_url: string | null
  category: string | null
  tags: string[] | null
  impact_score: number
  similarity: number
}

/**
 * Performs a vector similarity search for articles matching the query
 */
export async function vectorSearch(
  query: string,
  options: {
    limit?: number
    categoryFilter?: string | null
    minImpactScore?: number | null
    maxResults?: number
  } = {},
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the search query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      dimensions: 1536,
    })

    const embedding = embeddingResponse.data[0].embedding

    // Set up the base query
    let supabaseQuery = supabase.rpc("match_news_articles", {
      query_embedding: embedding,
      match_threshold: 0.5, // Minimum similarity threshold
      match_count: options.maxResults || 20, // Maximum number of matches to return
    })

    // Apply category filter if provided
    if (options.categoryFilter) {
      supabaseQuery = supabaseQuery.eq("category", options.categoryFilter)
    }

    // Apply impact score filter if provided
    if (options.minImpactScore !== undefined && options.minImpactScore !== null) {
      supabaseQuery = supabaseQuery.gte("impact_score", options.minImpactScore)
    }

    // Execute the query
    const { data: articles, error } = await supabaseQuery.limit(options.limit || 10)

    if (error) {
      console.error("Error performing vector search:", error)
      throw new Error("Failed to perform search")
    }

    return articles as SearchResult[]
  } catch (error) {
    console.error("Vector search error:", error)
    throw new Error("Failed to perform vector search")
  }
}

/**
 * Alias for vectorSearch to maintain backward compatibility
 * @deprecated Use vectorSearch instead
 */
export async function searchArticlesByVector(query: string, limit = 10): Promise<SearchResult[]> {
  return vectorSearch(query, { limit })
}

/**
 * Finds articles similar to a specific article by ID
 */
export async function findSimilarArticles(articleId: string, limit = 5): Promise<SearchResult[]> {
  try {
    // Get the article's embedding
    const { data: article, error: articleError } = await supabase
      .from("news_articles")
      .select("embedding, category")
      .eq("id", articleId)
      .single()

    if (articleError || !article || !article.embedding) {
      console.error("Error fetching article embedding:", articleError)
      throw new Error("Failed to find article or article has no embedding")
    }

    // Find similar articles using the article's embedding
    const { data: similarArticles, error: searchError } = await supabase
      .rpc("match_news_articles", {
        query_embedding: article.embedding,
        match_threshold: 0.6,
        match_count: limit + 1, // +1 because we'll filter out the original article
      })
      .neq("id", articleId) // Exclude the original article
      .limit(limit)

    if (searchError) {
      console.error("Error finding similar articles:", searchError)
      throw new Error("Failed to find similar articles")
    }

    return similarArticles as SearchResult[]
  } catch (error) {
    console.error("Find similar articles error:", error)
    throw new Error("Failed to find similar articles")
  }
}
