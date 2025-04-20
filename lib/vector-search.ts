import { createAdminClient } from "@/lib/supabase-server"
import { generateEmbedding } from "@/lib/openai"

export async function searchArticlesByVector(query: string, limit = 5) {
  try {
    const supabaseAdmin = createAdminClient()

    // Generate embedding for the query
    const embedding = await generateEmbedding(query)

    // Perform vector search
    const { data: articles, error } = await supabaseAdmin.rpc("match_articles", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
    })

    if (error) {
      throw error
    }

    return articles
  } catch (error) {
    console.error("Error in vector search:", error)
    throw error
  }
}
