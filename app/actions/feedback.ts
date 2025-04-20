"use server"
import { makeClient } from "@/lib/serverClient"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

interface RecommendationFeedback {
  userId: string
  recommendationId: string
  rating: number // 1–5
  helpful?: boolean
  applied?: boolean
  feedbackText?: string
}

export async function submitRecommendationFeedback(
  feedback: RecommendationFeedback,
): Promise<{ success: boolean; error?: string }> {
  const supabase = makeClient()

  // 1) Validate
  if (!feedback.userId || !feedback.recommendationId || !feedback.rating) {
    return { success: false, error: "Missing required fields" }
  }
  if (feedback.rating < 1 || feedback.rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" }
  }

  // 2) Insert feedback
  const { error: insertError } = await supabase.from("recommendation_feedback").insert({
    user_id: feedback.userId,
    recommendation_id: feedback.recommendationId,
    rating: feedback.rating,
    helpful: feedback.helpful,
    applied: feedback.applied,
    feedback_text: feedback.feedbackText,
  })
  if (insertError) {
    console.error(insertError)
    return { success: false, error: "Failed to submit feedback" }
  }

  // 3) Update user_preferences
  const { data: userPrefs } = await supabase
    .from("user_preferences")
    .select("preferences")
    .eq("user_id", feedback.userId)
    .single()

  if (userPrefs) {
    const updated = {
      ...(userPrefs.preferences || {}),
      aiRecommendations: {
        ...(userPrefs.preferences?.aiRecommendations || {}),
        lastFeedback: {
          recommendationId: feedback.recommendationId,
          rating: feedback.rating,
          timestamp: new Date().toISOString(),
        },
      },
    }
    await supabase
      .from("user_preferences")
      .update({ preferences: updated, updated_at: new Date().toISOString() })
      .eq("user_id", feedback.userId)
  }

  // 4) Revalidate
  revalidatePath("/settings/ai-recommendations")
  revalidatePath("/settings/impact-factors")

  return { success: true }
}

export async function generateRecommendationId(): Promise<string> {
  return uuidv4()
}

export async function getRecommendationFeedbackStats(): Promise<{
  success: boolean
  stats?: {
    totalFeedback: number
    averageRating: number
    helpfulPercentage: number
    appliedPercentage: number
  }
  error?: string
}> {
  const supabase = makeClient()

  // Total count
  const { count, error: countError } = await supabase
    .from("recommendation_feedback")
    .select("*", { count: "exact", head: true })
  if (countError) throw countError

  if (!count) {
    return {
      success: true,
      stats: { totalFeedback: 0, averageRating: 0, helpfulPercentage: 0, appliedPercentage: 0 },
    }
  }

  // Average rating
  const { data: ratings } = await supabase.from("recommendation_feedback").select("rating")
  const avg = ratings.reduce((sum, { rating }) => sum + rating, 0) / ratings.length

  // Helpful %
  const { data: helps } = await supabase.from("recommendation_feedback").select("helpful").not("helpful", "is", null)
  const helpCount = helps.filter((h) => h.helpful).length
  const helpPct = helps.length ? (helpCount / helps.length) * 100 : 0

  // Applied %
  const { data: apps } = await supabase.from("recommendation_feedback").select("applied").not("applied", "is", null)
  const appCount = apps.filter((a) => a.applied).length
  const appPct = apps.length ? (appCount / apps.length) * 100 : 0

  return {
    success: true,
    stats: {
      totalFeedback: count,
      averageRating: Number(avg.toFixed(1)),
      helpfulPercentage: Number(helpPct.toFixed(1)),
      appliedPercentage: Number(appPct.toFixed(1)),
    },
  }
}
