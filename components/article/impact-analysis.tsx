import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ImpactAnalysisProps {
  article: any
}

export function ImpactAnalysis({ article }: ImpactAnalysisProps) {
  // Calculate impact scores
  const marketImpact = Math.round(article.impact_score)
  const competitorImpact = Math.round(article.impact_score * 0.45) // Simulating competitor impact at 45% of our score

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-md">Impact Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Market Impact</span>
            <span className="text-sm font-medium">{marketImpact}%</span>
          </div>
          <Progress value={marketImpact} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Competitor Impact</span>
            <span className="text-sm font-medium">{competitorImpact}%</span>
          </div>
          <Progress value={competitorImpact} className="h-2" />
        </div>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-2">
            {marketImpact >= 80
              ? "This article has a high impact score, indicating it may require immediate attention."
              : marketImpact >= 50
                ? "This article has a moderate impact score and may be worth monitoring."
                : "This article has a low impact score and is likely for informational purposes only."}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Category Rank:</span>
              <span className="text-xs font-medium">#3</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Related:</span>
              <span className="text-xs font-medium">3</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
