import { ImpactFactorsSettings } from "@/components/settings/impact-factors-settings"
import { AiRecommendationBanner } from "@/components/settings/ai-recommendation-banner"

export default function ImpactFactorsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Impact Factor Settings</h1>
        <p className="text-muted-foreground mt-1">Customize how different factors influence your impact scores</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <AiRecommendationBanner />
          <ImpactFactorsSettings />
        </div>
      </div>
    </div>
  )
}
