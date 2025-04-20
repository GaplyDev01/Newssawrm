import { supabase } from "@/lib/supabase-client"

// Types for reading events
export interface ReadingEvent {
  userId: string
  articleId: string
  eventType: "view" | "read" | "save" | "share" | "like"
  duration?: number // Time spent in seconds
  completionPercentage?: number // How much of the article was read
  timestamp: string
}

// Track a reading event
export async function trackReadingEvent(event: Omit<ReadingEvent, "timestamp">) {
  try {
    const timestamp = new Date().toISOString()

    // Store the event in the database
    const { error } = await supabase.from("user_reading_events").insert({
      user_id: event.userId,
      article_id: event.articleId,
      event_type: event.eventType,
      duration: event.duration,
      completion_percentage: event.completionPercentage,
      created_at: timestamp,
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error tracking reading event:", error)
    return { success: false, error }
  }
}

// Get reading history for a user
export async function getUserReadingHistory(userId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from("user_reading_events")
      .select(`
        *,
        news_articles (
          id,
          title,
          content,
          summary,
          category,
          tags,
          impact_score,
          source_id,
          news_sources (
            name,
            category
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error getting reading history:", error)
    return { success: false, error, data: [] }
  }
}
