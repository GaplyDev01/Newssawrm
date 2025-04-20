"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function FeedbackReminder() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [feedbackRequested, setFeedbackRequested] = useState(false)

  useEffect(() => {
    const checkFeedbackStatus = async () => {
      try {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) return

        // Check if feedback was requested but not yet provided
        const { data: userPrefs } = await supabase
          .from("user_preferences")
          .select("preferences")
          .eq("user_id", user.user.id)
          .single()

        if (
          userPrefs?.preferences?.aiRecommendations?.feedbackRequested &&
          (!userPrefs.preferences.aiRecommendations.lastFeedback ||
            userPrefs.preferences.aiRecommendations.lastFeedback.recommendationId !==
              userPrefs.preferences.aiRecommendations.recommendationId)
        ) {
          setFeedbackRequested(true)
          setIsVisible(true)
        }
      } catch (error) {
        console.error("Error checking feedback status:", error)
      }
    }

    checkFeedbackStatus()
  }, [])

  if (!isVisible || !feedbackRequested) return null

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium">How were the AI recommendations?</h3>
            <p className="text-sm text-muted-foreground">
              We'd love to hear your thoughts on the impact factor recommendations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/settings/ai-recommendations")}
              className="whitespace-nowrap"
            >
              Provide Feedback
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
