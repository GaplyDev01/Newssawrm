"use server"

import { createAdminClient } from "@/lib/supabase-server"
import { generateEmbedding } from "@/lib/openai"
import { revalidatePath } from "next/cache"

// Generate embedding for a single article
export async function generateArticleEmbedding(articleId: string) {
  const supabase = createAdminClient()

  try {
    // Get the article
    const { data: article, error } = await supabase
      .from("news_articles")
      .select("title, content, summary")
      .eq("id", articleId)
      .single()

    if (error || !article) {
      throw new Error(`Error fetching article: ${error?.message || "Article not found"}`)
    }

    // Prepare text for embedding
    const textToEmbed = `
      Title: ${article.title}
      ${article.summary ? `Summary: ${article.summary}` : ""}
      Content: ${article.content}
    `.trim()

    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed)

    // Update article with embedding
    const { error: updateError } = await supabase
      .from("news_articles")
      .update({
        embedding,
        last_embedded_at: new Date().toISOString(),
      })
      .eq("id", articleId)

    if (updateError) {
      throw new Error(`Error updating article embedding: ${updateError.message}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in generateArticleEmbedding:", error)

    // Log the error
    await supabase.from("error_logs").insert({
      level: "error",
      message: `Failed to generate embedding for article ${articleId}`,
      source: "embedding-actions.ts",
      context: { articleId, error: error.message },
      timestamp: new Date().toISOString(),
    })

    return { success: false, error: error.message }
  }
}

// Generate embeddings for all articles without embeddings
export async function generateMissingEmbeddings() {
  const supabase = createAdminClient()

  try {
    // Get articles without embeddings
    const { data: articles, error } = await supabase
      .from("news_articles")
      .select("id, title")
      .is("embedding", null)
      .order("published_at", { ascending: false })
      .limit(10) // Process in batches

    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`)
    }

    if (!articles || articles.length === 0) {
      return { success: true, message: "No articles without embeddings found" }
    }

    // Process each article
    const results = await Promise.all(articles.map((article) => generateArticleEmbedding(article.id)))

    // Count successes and failures
    const successes = results.filter((r) => r.success).length
    const failures = results.filter((r) => !r.success).length

    revalidatePath("/admin/embeddings")

    return {
      success: true,
      message: `Processed ${articles.length} articles: ${successes} succeeded, ${failures} failed`,
    }
  } catch (error: any) {
    console.error("Error in generateMissingEmbeddings:", error)

    // Log the error
    await supabase.from("error_logs").insert({
      level: "error",
      message: "Failed to generate missing embeddings",
      source: "embedding-actions.ts",
      context: { error: error.message },
      timestamp: new Date().toISOString(),
    })

    return { success: false, error: error.message }
  }
}

// Refresh embeddings for articles that haven't been updated in a while
export async function refreshOldEmbeddings(daysOld = 30) {
  const supabase = createAdminClient()

  try {
    // Calculate the cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // Get articles with old embeddings
    const { data: articles, error } = await supabase
      .from("news_articles")
      .select("id, title")
      .lt("last_embedded_at", cutoffDate.toISOString())
      .not("embedding", "is", null)
      .order("last_embedded_at", { ascending: true })
      .limit(10) // Process in batches

    if (error) {
      throw new Error(`Error fetching articles: ${error.message}`)
    }

    if (!articles || articles.length === 0) {
      return { success: true, message: "No articles with old embeddings found" }
    }

    // Process each article
    const results = await Promise.all(articles.map((article) => generateArticleEmbedding(article.id)))

    // Count successes and failures
    const successes = results.filter((r) => r.success).length
    const failures = results.filter((r) => !r.success).length

    revalidatePath("/admin/embeddings")

    return {
      success: true,
      message: `Refreshed ${articles.length} articles: ${successes} succeeded, ${failures} failed`,
    }
  } catch (error: any) {
    console.error("Error in refreshOldEmbeddings:", error)

    // Log the error
    await supabase.from("error_logs").insert({
      level: "error",
      message: "Failed to refresh old embeddings",
      source: "embedding-actions.ts",
      context: { daysOld, error: error.message },
      timestamp: new Date().toISOString(),
    })

    return { success: false, error: error.message }
  }
}
