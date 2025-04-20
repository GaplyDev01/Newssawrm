import dotenv from "dotenv"
dotenv.config()

import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import { setTimeout } from "timers/promises"

// Create clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configuration
const BATCH_SIZE = 10 // Process in smaller batches
const RATE_LIMIT_DELAY = 1000 // 1 second delay between batches
const EMBEDDING_MODEL = "text-embedding-3-small" // Updated to newer model

async function main() {
  console.log("Starting embedding generation process...")

  // 1) Count total articles missing embeddings
  const { count, error: countErr } = await supabase
    .from("news_articles")
    .select("id", { count: "exact", head: true })
    .is("embedding", null)

  if (countErr) {
    console.error("Error counting articles:", countErr)
    process.exit(1)
  }

  console.log(`Found ${count} articles without embeddings.`)

  if (count === 0) {
    console.log("No articles need embedding. Exiting.")
    return
  }

  // 2) Process in batches
  let processed = 0
  let successful = 0
  let failed = 0

  while (processed < count) {
    // Fetch a batch of articles
    const { data: batch, error: fetchErr } = await supabase
      .from("news_articles")
      .select("id, title, content, summary, category, tags")
      .is("embedding", null)
      .limit(BATCH_SIZE)

    if (fetchErr) {
      console.error("Error fetching articles batch:", fetchErr)
      process.exit(1)
    }

    console.log(`Processing batch of ${batch.length} articles...`)

    // Process each article in the batch
    for (const article of batch) {
      try {
        // Create a rich text representation for better embeddings
        const richText = createRichTextRepresentation(article)

        // Generate embedding
        const res = await openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: richText,
          dimensions: 1536, // Explicitly set dimensions
        })

        const embedding = res.data[0].embedding

        // Update article with embedding
        const { error: updateErr } = await supabase
          .from("news_articles")
          .update({
            embedding,
            last_embedded_at: new Date().toISOString(),
          })
          .eq("id", article.id)

        if (updateErr) {
          console.error(`Failed to update article ${article.id}:`, updateErr)
          failed++
        } else {
          console.log(`✅ Embedded article: ${article.id} - ${article.title.substring(0, 40)}...`)
          successful++
        }
      } catch (err) {
        console.error(`Error processing article ${article.id}:`, err.message)
        failed++
      }

      processed++
    }

    // Progress update
    console.log(`Progress: ${processed}/${count} (${Math.round((processed / count) * 100)}%)`)
    console.log(`Success: ${successful}, Failed: ${failed}`)

    // Rate limiting delay between batches
    if (processed < count) {
      console.log(`Waiting ${RATE_LIMIT_DELAY}ms before next batch...`)
      await setTimeout(RATE_LIMIT_DELAY)
    }
  }

  console.log("\n===== Embedding Generation Complete =====")
  console.log(`Total articles processed: ${processed}`)
  console.log(`Successfully embedded: ${successful}`)
  console.log(`Failed to embed: ${failed}`)
}

// Helper function to create a rich text representation for better embeddings
function createRichTextRepresentation(article) {
  const parts = [`TITLE: ${article.title}`]

  if (article.summary) {
    parts.push(`SUMMARY: ${article.summary}`)
  }

  if (article.category) {
    parts.push(`CATEGORY: ${article.category}`)
  }

  if (article.tags && article.tags.length > 0) {
    parts.push(`TAGS: ${article.tags.join(", ")}`)
  }

  parts.push(`CONTENT: ${article.content}`)

  // Join all parts and limit to model's context window
  return parts.join("\n\n").slice(0, 8191)
}

// Run the script
main()
  .then(() => {
    console.log("Script completed successfully.")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Script failed with error:", err)
    process.exit(1)
  })
