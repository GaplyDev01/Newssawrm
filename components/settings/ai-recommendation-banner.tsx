"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function AiRecommendationBanner() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [hasEnoughHistory, setHasEnoughHistory] = useState(false)

  useEffect(() => {
    const checkReadingHistory = async () => {
      try {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) return

        // Check if user has enough reading history for recommendations
        const { count, error } = await supabase
          .from("user_reading_events")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.user.id)

        if (error) throw error

        // Show banner if user has at least 5 reading events
        setHasEnoughHistory(count !== null && count >= 5)
        setIsVisible(count !== null && count >= 5)
      } catch (error) {
        console.error("Error checking reading history:", error)
      }
    }

    checkReadingHistory()
  }, [])

  if (!isVisible || !hasEnoughHistory) return null

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">AI Recommendations Available</h3>
              <p className="text-sm text-muted-foreground">
                Based on your reading patterns, our AI can suggest optimal impact factor weights tailored to your
                interests.
              </p>
            </div>
          </div>

          <Button onClick={() => router.push("/settings/ai-recommendations")} className="self-end sm:self-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            View Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
