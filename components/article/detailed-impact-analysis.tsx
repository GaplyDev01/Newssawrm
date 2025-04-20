"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Settings, ChevronDown, ChevronUp, Wand2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { calculatePersonalizedImpactScore } from "@/lib/impact-score"
import { supabase } from "@/lib/supabase"
import { defaultImpactFactors } from "@/lib/types/impact-score"
import { SetupWizardButton } from "@/components/onboarding/setup-wizard-button"

interface DetailedImpactAnalysisProps {
  article: any
}

export function DetailedImpactAnalysis({ article }: DetailedImpactAnalysisProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [factorScores, setFactorScores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [hasConfiguredFactors, setHasConfiguredFactors] = useState(true)

  useEffect(() => {
    const loadPersonalizedScores = async () => {
      setLoading(true)
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Check if user has personalized preferences
          const { data: userPrefs } = await supabase
            .from("user_preferences")
            .select("preferences")
            .eq("user_id", user.id)
            .single()

          const hasFactors = userPrefs?.preferences?.impactFactors !== undefined
          setIsPersonalized(hasFactors)
          setHasConfiguredFactors(hasFactors)

          // Calculate personalized scores
          const { factorScores } = await calculatePersonalizedImpactScore(article, user.id)
          setFactorScores(factorScores)
        } else {
          // Calculate with default weights
          const { factorScores } = await calculatePersonalizedImpactScore(article)
          setFactorScores(factorScores)
        }
      } catch (error) {
        console.error("Error loading personalized scores:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPersonalizedScores()
  }, [article])

  const handleSettingsClick = () => {
    router.push("/settings/impact-factors")
  }

  // Get factor name from ID
  const getFactorName = (factorId: string) => {
    const factor = defaultImpactFactors.find((f) => f.id === factorId)
    return factor?.name || factorId
  }

  // Get top 3 factors by score
  const topFactors = Object.entries(factorScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, 3)

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading impact analysis...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-md">Impact Analysis</CardTitle>
        {isPersonalized && (
          <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Personalized</div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Impact</span>
            <span className="text-sm font-medium">{article.impact_score}%</span>
          </div>
          <Progress value={article.impact_score} className="h-2" />
        </div>

        {/* Top factors */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Top Impact Factors</span>
          </div>

          {topFactors.map(([factorId, score]) => (
            <div key={factorId} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>{getFactorName(factorId)}</span>
                <span>{Math.round(score)}%</span>
              </div>
              <Progress value={score} className="h-1" />
            </div>
          ))}
        </div>

        {/* Expanded view with all factors */}
        {expanded && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">All Factors</span>
            </div>

            {Object.entries(factorScores)
              .filter(([factorId]) => !topFactors.some(([topId]) => topId === factorId))
              .map(([factorId, score]) => (
                <div key={factorId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{getFactorName(factorId)}</span>
                    <span>{Math.round(score)}%</span>
                  </div>
                  <Progress value={score} className="h-1" />
                </div>
              ))}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center justify-center gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show All Factors
              </>
            )}
          </Button>

          {hasConfiguredFactors ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center justify-center gap-1"
              onClick={handleSettingsClick}
            >
              <Settings className="h-3 w-3" />
              Customize Impact Factors
            </Button>
          ) : (
            <SetupWizardButton variant="outline" size="sm" className="text-xs" showIcon={false}>
              <Wand2 className="h-3 w-3 mr-1" />
              Setup Impact Factors
            </SetupWizardButton>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
