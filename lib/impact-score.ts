import { supabase } from "@/lib/supabase"
import { defaultImpactFactors } from "@/lib/types/impact-score"

// Calculate personalized impact score
export async function calculatePersonalizedImpactScore(
  articleData: any,
  userId?: string,
): Promise<{
  overallScore: number
  factorScores: Record<string, number>
}> {
  try {
    // Default weights if no user or preferences
    let factorWeights = defaultImpactFactors.reduce(
      (acc, factor) => {
        acc[factor.id] = factor.defaultWeight
        return acc
      },
      {} as Record<string, number>,
    )

    // If we have a userId, try to get their preferences
    if (userId) {
      const { data: userPrefs } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", userId)
        .single()

      if (userPrefs?.preferences?.impactFactors) {
        factorWeights = {
          ...factorWeights,
          ...userPrefs.preferences.impactFactors,
        }
      }
    }

    // Calculate individual factor scores (mock implementation)
    // In a real app, this would analyze the article content in depth
    const factorScores: Record<string, number> = {
      market_volatility: Math.min(100, Math.max(0, articleData.impact_score * 0.9 + Math.random() * 10)),
      trading_volume: Math.min(100, Math.max(0, articleData.impact_score * 0.8 + Math.random() * 15)),
      regulatory_implications: Math.min(100, Math.max(0, articleData.impact_score * 1.1 - Math.random() * 10)),
      technology_advancement: Math.min(100, Math.max(0, articleData.impact_score * 0.95 + Math.random() * 5)),
      network_security: Math.min(100, Math.max(0, articleData.impact_score * 1.05 - Math.random() * 5)),
      adoption_metrics: Math.min(100, Math.max(0, articleData.impact_score * 0.85 + Math.random() * 10)),
      portfolio_relevance: Math.min(100, Math.max(0, articleData.impact_score * 0.9 + Math.random() * 10)),
      industry_focus: Math.min(100, Math.max(0, articleData.impact_score * 0.95 + Math.random() * 5)),
      geographic_relevance: Math.min(100, Math.max(0, articleData.impact_score * 0.7 + Math.random() * 20)),
    }

    // Calculate weighted average for overall score
    let totalWeight = 0
    let weightedSum = 0

    for (const factorId in factorScores) {
      const weight = factorWeights[factorId] || 50 // Default to 50 if missing
      totalWeight += weight
      weightedSum += factorScores[factorId] * weight
    }

    const overallScore = Math.round(weightedSum / totalWeight)

    return {
      overallScore,
      factorScores,
    }
  } catch (error) {
    console.error("Error calculating personalized impact score:", error)
    // Return the original impact score if there's an error
    return {
      overallScore: articleData.impact_score,
      factorScores: {},
    }
  }
}
