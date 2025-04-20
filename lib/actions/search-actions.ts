"use server"

import { generateEmbedding } from "@/lib/openai"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function searchArticles(query: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Generate embedding for the search query
    const embedding = await generateEmbedding(query)

    // Use the match_articles function to find similar articles
    const { data, error } = await supabase.rpc("match_articles", {
      query_embedding: embedding,
      match_threshold: 0.5, // Adjust this threshold as needed
      match_count: 10, // Return top 10 results
    })

    if (error) {
      console.error("Error searching articles:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in searchArticles:", error)
    return []
  }
}
