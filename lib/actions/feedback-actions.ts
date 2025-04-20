"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

interface RecommendationFeedback {
  userId: string
  recommendationId: string
  rating: number // 1-5 star rating
  helpful?: boolean
  applied?: boolean
  feedbackText?: string
}

export async function submitRecommendationFeedback(
  feedback: RecommendationFeedback,
): Promise<{ success: boolean; error?: string }> {
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

    // Validate input
    if (!feedback.userId || !feedback.recommendationId || !feedback.rating) {
      return { success: false, error: "Missing required fields" }
    }

    if (feedback.rating < 1 || feedback.rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" }
    }

    // Insert feedback into database
    const { error } = await supabase.from("recommendation_feedback").insert({
      user_id: feedback.userId,
      recommendation_id: feedback.recommendationId,
      rating: feedback.rating,
      helpful: feedback.helpful,
      applied: feedback.applied,
      feedback_text: feedback.feedbackText,
    })

    if (error) throw error

    // Update user preferences to record that feedback was provided
    const { data: userPrefs } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", feedback.userId)
      .single()

    if (userPrefs) {
      const updatedPreferences = {
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
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", feedback.userId)
    }

    // Revalidate relevant paths
    revalidatePath("/settings/ai-recommendations")
    revalidatePath("/settings/impact-factors")

    return { success: true }
  } catch (error) {
    console.error("Error submitting recommendation feedback:", error)
    return { success: false, error: "Failed to submit feedback" }
  }
}

// Generate a unique ID for a recommendation batch
// Changed from regular function to async function
export async function generateRecommendationId(): Promise<string> {
  return uuidv4()
}

// Get feedback statistics for recommendations
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

    // Get total count
    const { count, error: countError } = await supabase
      .from("recommendation_feedback")
      .select("*", { count: "exact", head: true })

    if (countError) throw countError

    // If no feedback yet, return empty stats
    if (!count || count === 0) {
      return {
        success: true,
        stats: {
          totalFeedback: 0,
          averageRating: 0,
          helpfulPercentage: 0,
          appliedPercentage: 0,
        },
      }
    }

    // Get average rating
    const { data: ratingData, error: ratingError } = await supabase.from("recommendation_feedback").select("rating")

    if (ratingError) throw ratingError

    const averageRating = ratingData.reduce((sum, item) => sum + item.rating, 0) / ratingData.length

    // Get helpful percentage
    const { data: helpfulData, error: helpfulError } = await supabase
      .from("recommendation_feedback")
      .select("helpful")
      .not("helpful", "is", null)

    if (helpfulError) throw helpfulError

    const helpfulCount = helpfulData.filter((item) => item.helpful).length
    const helpfulPercentage = helpfulData.length > 0 ? (helpfulCount / helpfulData.length) * 100 : 0

    // Get applied percentage
    const { data: appliedData, error: appliedError } = await supabase
      .from("recommendation_feedback")
      .select("applied")
      .not("applied", "is", null)

    if (appliedError) throw appliedError

    const appliedCount = appliedData.filter((item) => item.applied).length
    const appliedPercentage = appliedData.length > 0 ? (appliedCount / appliedData.length) * 100 : 0

    return {
      success: true,
      stats: {
        totalFeedback: count,
        averageRating: Number.parseFloat(averageRating.toFixed(1)),
        helpfulPercentage: Number.parseFloat(helpfulPercentage.toFixed(1)),
        appliedPercentage: Number.parseFloat(appliedPercentage.toFixed(1)),
      },
    }
  } catch (error) {
    console.error("Error getting recommendation feedback stats:", error)
    return { success: false, error: "Failed to get feedback statistics" }
  }
}
