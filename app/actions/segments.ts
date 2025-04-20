"use server"
import { makeClient } from "@/lib/serverClient"

// Types for user segments
export interface UserSegment {
  id: string
  name: string
  description: string
  userCount: number
  averageRating: number
  topFactors: Array<{
    factorId: string
    weight: number
  }>
  createdAt: string
}

export interface UserFeedbackPattern {
  userId: string
  feedbackCount: number
  averageRating: number
  factorPreferences: Record<string, number>
  lastFeedback: string
  segment?: string
}

// Analyze user feedback and identify clusters
export async function analyzeUserFeedbackPatterns(): Promise<{
  success: boolean
  patterns?: UserFeedbackPattern[]
  error?: string
}> {
  try {
    const supabase = makeClient()

    // Get all users with feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("recommendation_feedback")
      .select("*")
      .order("created_at", { ascending: false })

    if (feedbackError) throw feedbackError

    if (!feedbackData || feedbackData.length === 0) {
      return {
        success: true,
        patterns: [],
      }
    }

    // Group feedback by user
    const userFeedbackMap: Record<string, any[]> = {}
    feedbackData.forEach((feedback) => {
      if (!userFeedbackMap[feedback.user_id]) {
        userFeedbackMap[feedback.user_id] = []
      }
      userFeedbackMap[feedback.user_id].push(feedback)
    })

    // Get user preferences to analyze factor weights
    const userPatterns: UserFeedbackPattern[] = []

    for (const userId in userFeedbackMap) {
      const userFeedback = userFeedbackMap[userId]

      // Get user's current factor preferences
      const { data: userPrefs } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", userId)
        .single()

      // Calculate average rating
      const totalRating = userFeedback.reduce((sum, feedback) => sum + (feedback.rating || 0), 0)
      const averageRating = userFeedback.length > 0 ? totalRating / userFeedback.length : 0

      // Extract factor preferences
      const factorPreferences = userPrefs?.preferences?.impactFactors || {}

      userPatterns.push({
        userId,
        feedbackCount: userFeedback.length,
        averageRating,
        factorPreferences,
        lastFeedback: userFeedback[0].created_at,
      })
    }

    return {
      success: true,
      patterns: userPatterns,
    }
  } catch (error) {
    console.error("Error analyzing user feedback patterns:", error)
    return {
      success: false,
      error: "Failed to analyze user feedback patterns",
    }
  }
}

// Identify user segments based on feedback patterns
export async function identifyUserSegments(): Promise<{
  success: boolean
  segments?: UserSegment[]
  error?: string
}> {
  try {
    const supabase = makeClient()

    // Get user feedback patterns
    const { success, patterns, error } = await analyzeUserFeedbackPatterns()

    if (!success || !patterns) {
      throw new Error(error || "Failed to analyze user feedback patterns")
    }

    if (patterns.length === 0) {
      return {
        success: true,
        segments: [],
      }
    }

    // Simple clustering based on factor preferences
    // In a real implementation, you would use a more sophisticated algorithm like k-means
    const segments: Record<
      string,
      {
        users: string[]
        factorSums: Record<string, number>
        ratingSum: number
      }
    > = {}

    // Identify segments based on dominant factors
    patterns.forEach((pattern) => {
      // Find the dominant factor category
      const factorCategories = {
        market: 0,
        technical: 0,
        personal: 0,
      }

      // Calculate average weight for each category
      let marketFactorCount = 0
      let technicalFactorCount = 0
      let personalFactorCount = 0

      Object.entries(pattern.factorPreferences).forEach(([factorId, weight]) => {
        if (factorId.includes("market")) {
          factorCategories.market += weight
          marketFactorCount++
        } else if (factorId.includes("technology") || factorId.includes("network") || factorId.includes("adoption")) {
          factorCategories.technical += weight
          technicalFactorCount++
        } else if (factorId.includes("portfolio") || factorId.includes("industry") || factorId.includes("geographic")) {
          factorCategories.personal += weight
          personalFactorCount++
        }
      })

      // Calculate averages
      if (marketFactorCount > 0) factorCategories.market /= marketFactorCount
      if (technicalFactorCount > 0) factorCategories.technical /= technicalFactorCount
      if (personalFactorCount > 0) factorCategories.personal /= personalFactorCount

      // Determine dominant category
      let dominantCategory = "balanced"
      const threshold = 15 // Minimum difference to consider a category dominant

      if (
        factorCategories.market > factorCategories.technical + threshold &&
        factorCategories.market > factorCategories.personal + threshold
      ) {
        dominantCategory = "market_focused"
      } else if (
        factorCategories.technical > factorCategories.market + threshold &&
        factorCategories.technical > factorCategories.personal + threshold
      ) {
        dominantCategory = "technical_focused"
      } else if (
        factorCategories.personal > factorCategories.market + threshold &&
        factorCategories.personal > factorCategories.technical + threshold
      ) {
        dominantCategory = "personal_focused"
      }

      // Further segment by rating behavior
      let ratingSegment = ""
      if (pattern.averageRating >= 4) {
        ratingSegment = "high_satisfaction"
      } else if (pattern.averageRating >= 3) {
        ratingSegment = "medium_satisfaction"
      } else {
        ratingSegment = "low_satisfaction"
      }

      // Combine for final segment
      const segmentId = `${dominantCategory}_${ratingSegment}`

      // Initialize segment if it doesn't exist
      if (!segments[segmentId]) {
        segments[segmentId] = {
          users: [],
          factorSums: {},
          ratingSum: 0,
        }
      }

      // Add user to segment
      segments[segmentId].users.push(pattern.userId)
      segments[segmentId].ratingSum += pattern.averageRating

      // Add factor preferences to segment totals
      Object.entries(pattern.factorPreferences).forEach(([factorId, weight]) => {
        if (!segments[segmentId].factorSums[factorId]) {
          segments[segmentId].factorSums[factorId] = 0
        }
        segments[segmentId].factorSums[factorId] += weight
      })

      // Update user's segment in their pattern
      pattern.segment = segmentId
    })

    // Format segments for return
    const formattedSegments: UserSegment[] = Object.entries(segments).map(([segmentId, data]) => {
      // Calculate average factor weights
      const topFactors = Object.entries(data.factorSums)
        .map(([factorId, sum]) => ({
          factorId,
          weight: Math.round(sum / data.users.length),
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5)

      // Format segment name and description
      const [focus, satisfaction] = segmentId.split("_")

      let name = ""
      let description = ""

      // Format focus part
      if (focus === "market_focused") {
        name = "Market-Focused"
        description = "Users who prioritize market impact factors"
      } else if (focus === "technical_focused") {
        name = "Technical-Focused"
        description = "Users who prioritize technical impact factors"
      } else if (focus === "personal_focused") {
        name = "Personal-Focused"
        description = "Users who prioritize personal impact factors"
      } else {
        name = "Balanced"
        description = "Users with balanced factor preferences"
      }

      // Add satisfaction level
      if (satisfaction === "high_satisfaction") {
        name += " (High Satisfaction)"
        description += " with high recommendation satisfaction"
      } else if (satisfaction === "medium_satisfaction") {
        name += " (Medium Satisfaction)"
        description += " with moderate recommendation satisfaction"
      } else {
        name += " (Low Satisfaction)"
        description += " with low recommendation satisfaction"
      }

      return {
        id: segmentId,
        name,
        description,
        userCount: data.users.length,
        averageRating: Number((data.ratingSum / data.users.length).toFixed(1)),
        topFactors,
        createdAt: new Date().toISOString(),
      }
    })

    // Update user preferences with segment information
    for (const pattern of patterns) {
      if (pattern.segment) {
        const { data: userPrefs } = await supabase
          .from("user_preferences")
          .select("preferences")
          .eq("user_id", pattern.userId)
          .single()

        if (userPrefs) {
          const updatedPreferences = {
            ...(userPrefs.preferences || {}),
            userSegment: {
              segmentId: pattern.segment,
              assignedAt: new Date().toISOString(),
            },
          }

          await supabase
            .from("user_preferences")
            .update({
              preferences: updatedPreferences,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", pattern.userId)
        }
      }
    }

    // Cache the segments
    await supabase
      .from("admin_settings")
      .upsert({
        key: "user_segments",
        value: formattedSegments,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "user_segments")

    // Update last segmentation time
    await supabase
      .from("admin_settings")
      .upsert({
        key: "last_segmentation",
        value: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("key", "last_segmentation")

    return {
      success: true,
      segments: formattedSegments,
    }
  } catch (error) {
    console.error("Error identifying user segments:", error)
    return {
      success: false,
      error: "Failed to identify user segments",
    }
  }
}

// Get user segments
export async function getUserSegments(): Promise<{
  success: boolean
  segments?: UserSegment[]
  error?: string
}> {
  try {
    const supabase = makeClient()

    // Check if we need to recalculate segments
    const { data: lastSegmentation } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "last_segmentation")
      .single()

    const lastSegmentationTime = lastSegmentation?.value ? new Date(lastSegmentation.value) : null
    const now = new Date()

    // If last segmentation was more than a day ago or doesn't exist, recalculate
    if (!lastSegmentationTime || now.getTime() - lastSegmentationTime.getTime() > 24 * 60 * 60 * 1000) {
      const result = await identifyUserSegments()

      return result
    }

    // Otherwise, get cached segments
    const { data: cachedSegments } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "user_segments")
      .single()

    if (cachedSegments?.value) {
      return {
        success: true,
        segments: cachedSegments.value,
      }
    }

    // If no cached segments, calculate them
    const result = await identifyUserSegments()
    return result
  } catch (error) {
    console.error("Error getting user segments:", error)
    return {
      success: false,
      error: "Failed to get user segments",
    }
  }
}

// Get current user's segment
export async function getCurrentUserSegment(userId: string): Promise<{
  success: boolean
  segment?: UserSegment
  error?: string
}> {
  try {
    const supabase = makeClient()

    // Get user's segment ID from preferences
    const { data: userPrefs } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", userId)
      .single()

    const segmentId = userPrefs?.preferences?.userSegment?.segmentId

    if (!segmentId) {
      return {
        success: false,
        error: "User not assigned to any segment",
      }
    }

    // Get all segments
    const { success, segments, error } = await getUserSegments()

    if (!success || !segments) {
      throw new Error(error || "Failed to get user segments")
    }

    // Find user's segment
    const userSegment = segments.find((segment) => segment.id === segmentId)

    if (!userSegment) {
      return {
        success: false,
        error: "User segment not found",
      }
    }

    return {
      success: true,
      segment: userSegment,
    }
  } catch (error) {
    console.error("Error getting current user segment:", error)
    return {
      success: false,
      error: "Failed to get user segment",
    }
  }
}
