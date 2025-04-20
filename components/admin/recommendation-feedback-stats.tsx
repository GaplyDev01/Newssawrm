"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecommendationFeedbackStats } from "@/app/actions/feedback"
import { Star, ThumbsUp, CheckCircle, Loader2 } from "lucide-react"

export function RecommendationFeedbackStats() {
  const [stats, setStats] = useState<{
    totalFeedback: number
    averageRating: number
    helpfulPercentage: number
    appliedPercentage: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const result = await getRecommendationFeedbackStats()

        if (result.success && result.stats) {
          setStats(result.stats)
        } else {
          setError(result.error || "Failed to load feedback statistics")
        }
      } catch (error) {
        console.error("Error loading feedback stats:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendation Feedback</CardTitle>
          <CardDescription>Statistics on AI recommendation quality</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendation Feedback</CardTitle>
          <CardDescription>Statistics on AI recommendation quality</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendation Feedback</CardTitle>
          <CardDescription>Statistics on AI recommendation quality</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No feedback data available</p>
        </CardContent>
      </Card>
    )
  }

  // Render stars for average rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-2 font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendation Feedback</CardTitle>
        <CardDescription>Statistics on AI recommendation quality</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Total Feedback</div>
            <div className="text-2xl font-bold">{stats.totalFeedback}</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Average Rating</div>
            <div>{renderStars(stats.averageRating)}</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Helpful Percentage</div>
            <div className="flex items-center">
              <ThumbsUp className="h-5 w-5 mr-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.helpfulPercentage}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Applied Percentage</div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.appliedPercentage}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
