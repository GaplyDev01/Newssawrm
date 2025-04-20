import { generateEmbedding, analyzeArticle } from "@/lib/openai"
import { createAdminClient } from "@/lib/supabase-server"

// Mock news API function (in a real app, you would integrate with actual news APIs)
export async function fetchNewsFromAPIs() {
  // This is a mock function that would normally fetch from real news APIs
  // For demo purposes, we'll return mock data
  return [
    {
      title: "Bitcoin ETF Approval Sparks Institutional Investment Surge",
      content:
        "The recent approval of Bitcoin ETFs has led to a significant increase in institutional investments, with over $2 billion flowing into digital asset markets within the first week.",
      source: "Web3Wire",
      category: "Cryptocurrency",
      url: "https://example.com/bitcoin-etf-approval",
      published_at: new Date().toISOString(),
      image_url: "https://example.com/bitcoin-etf.jpg",
    },
    {
      title: "DeFi Protocol Aave Launches V4 with Enhanced Yield Strategies",
      content:
        "Aave has released version 4 of its protocol, introducing optimized yield strategies and reduced gas costs, aiming to improve capital efficiency for users.",
      source: "DeFi Insights",
      category: "DeFi",
      url: "https://example.com/aave-v4-launch",
      published_at: new Date().toISOString(),
      image_url: "https://example.com/aave-v4.jpg",
    },
    {
      title: "Major Upgrade to Ethereum Layer 2 Solution Reduces Fees by 80%",
      content:
        "A significant upgrade to one of Ethereum's leading Layer 2 solutions has resulted in an 80% reduction in transaction fees while maintaining security guarantees.",
      source: "Blockchain Report",
      category: "Ethereum",
      url: "https://example.com/ethereum-l2-upgrade",
      published_at: new Date().toISOString(),
      image_url: "https://example.com/ethereum-l2.jpg",
    },
    {
      title: "Web3 Ecosystem Sees Surge in Developer Activity",
      content:
        "Recent developments in the Web3 ecosystem suggest significant market movements ahead. Analysts point to increased institutional interest.",
      source: "CryptoIntel News",
      category: "Web3",
      url: "https://example.com/web3-developer-activity",
      published_at: new Date().toISOString(),
      image_url: "https://example.com/web3-dev.jpg",
    },
    {
      title: "Altcoins Network Achieves Record Transaction Volume",
      content:
        "The Altcoins community has been buzzing with excitement following recent protocol improvements and growing adoption rates across several sectors.",
      source: "CryptoIntel News",
      category: "Altcoins",
      url: "https://example.com/altcoins-volume",
      published_at: new Date().toISOString(),
      image_url: "https://example.com/altcoins.jpg",
    },
  ]
}

// Process and store news articles
export async function processAndStoreNews() {
  try {
    const supabaseAdmin = createAdminClient()
    const newsArticles = await fetchNewsFromAPIs()

    for (const article of newsArticles) {
      // Check if article already exists (by URL or title)
      const { data: existingArticle } = await supabaseAdmin
        .from("news_articles")
        .select("id")
        .eq("title", article.title)
        .single()

      if (existingArticle) {
        console.log(`Article already exists: ${article.title}`)
        continue
      }

      // Get or create source
      let sourceId
      const { data: existingSource } = await supabaseAdmin
        .from("news_sources")
        .select("id")
        .eq("name", article.source)
        .single()

      if (existingSource) {
        sourceId = existingSource.id
      } else {
        const { data: newSource } = await supabaseAdmin
          .from("news_sources")
          .insert({
            name: article.source,
            url: `https://example.com/${article.source.toLowerCase().replace(/\s+/g, "-")}`,
            category: article.category,
          })
          .select("id")
          .single()

        sourceId = newSource?.id
      }

      if (!sourceId) {
        throw new Error(`Failed to get or create source: ${article.source}`)
      }

      // Analyze article with OpenAI
      const analysis = await analyzeArticle({
        title: article.title,
        content: article.content,
        category: article.category,
      })

      // Generate embedding
      const embedding = await generateEmbedding(`${article.title} ${article.content}`)

      // Store article
      await supabaseAdmin.from("news_articles").insert({
        title: article.title,
        content: article.content,
        summary: analysis.summary,
        source_id: sourceId,
        published_at: article.published_at,
        url: article.url,
        image_url: article.image_url,
        category: article.category,
        tags: [article.category],
        impact_score: analysis.impact_score,
        embedding,
      })

      console.log(`Processed and stored article: ${article.title}`)
    }

    return { success: true, message: "News articles processed and stored" }
  } catch (error) {
    console.error("Error processing news:", error)
    return { success: false, message: "Failed to process news articles" }
  }
}

// Function to check for alerts
export async function checkForAlerts() {
  try {
    const supabaseAdmin = createAdminClient()

    // Get all active alerts
    const { data: alerts } = await supabaseAdmin.from("alerts").select("*").eq("is_active", true)

    if (!alerts || alerts.length === 0) {
      return { success: true, message: "No active alerts found" }
    }

    // Get recent news articles
    const { data: recentArticles } = await supabaseAdmin
      .from("news_articles")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(20)

    if (!recentArticles || recentArticles.length === 0) {
      return { success: true, message: "No recent articles found" }
    }

    // Check each alert against recent articles
    for (const alert of alerts) {
      const { user_id, alert_type, criteria } = alert

      // Different alert types
      switch (alert_type) {
        case "price_movement":
          // Price movement alerts would check external APIs
          break

        case "news_mention":
          // Check for keyword mentions
          if (criteria.keywords && Array.isArray(criteria.keywords)) {
            for (const article of recentArticles) {
              const articleText = `${article.title} ${article.content}`.toLowerCase()
              const foundKeyword = criteria.keywords.find((keyword: string) =>
                articleText.includes(keyword.toLowerCase()),
              )

              if (foundKeyword) {
                // Create notification
                await supabaseAdmin.from("alert_notifications").insert({
                  alert_id: alert.id,
                  user_id,
                  article_id: article.id,
                  message: `New article detected mentioning "${foundKeyword}"`,
                })
              }
            }
          }
          break

        case "trading_volume":
          // Trading volume alerts would check external APIs
          break

        case "sentiment_shift":
          // Sentiment shift alerts would analyze sentiment changes
          break
      }
    }

    return { success: true, message: "Alerts checked successfully" }
  } catch (error) {
    console.error("Error checking alerts:", error)
    return { success: false, message: "Failed to check alerts" }
  }
}
