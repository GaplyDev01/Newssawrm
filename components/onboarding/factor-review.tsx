"use client"

import type React from "react"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, BarChart2, Shield, Cpu, Lock, Users, Briefcase, Target, Globe, Info, Check } from "lucide-react"
import { useState } from "react"
import { defaultImpactFactors } from "@/lib/types/impact-score"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FactorReviewProps {
  factorWeights: Record<string, number>
  onFactorChange: (factorId: string, value: number[]) => void
  onComplete: () => void
  isSubmitting: boolean
}

export function FactorReview({ factorWeights, onFactorChange, onComplete, isSubmitting }: FactorReviewProps) {
  const [activeTab, setActiveTab] = useState("market")

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      "trending-up": <TrendingUp className="h-4 w-4" />,
      "bar-chart": <BarChart2 className="h-4 w-4" />,
      shield: <Shield className="h-4 w-4" />,
      cpu: <Cpu className="h-4 w-4" />,
      lock: <Lock className="h-4 w-4" />,
      users: <Users className="h-4 w-4" />,
      briefcase: <Briefcase className="h-4 w-4" />,
      target: <Target className="h-4 w-4" />,
      globe: <Globe className="h-4 w-4" />,
    }
    return icons[iconName] || <Info className="h-4 w-4" />
  }

  // Group factors by category
  const marketFactors = defaultImpactFactors.filter((f) => f.category === "market")
  const technicalFactors = defaultImpactFactors.filter((f) => f.category === "technical")
  const personalFactors = defaultImpactFactors.filter((f) => f.category === "personal")

  // Calculate average score for each category
  const getAverageScore = (factors: typeof defaultImpactFactors) => {
    if (factors.length === 0 || Object.keys(factorWeights).length === 0) return 0
    const sum = factors.reduce((acc, factor) => acc + (factorWeights[factor.id] || factor.defaultWeight), 0)
    return Math.round(sum / factors.length)
  }

  const marketAvg = getAverageScore(marketFactors)
  const technicalAvg = getAverageScore(technicalFactors)
  const personalAvg = getAverageScore(personalFactors)

  // Render factor slider
  const renderFactorSlider = (factor: (typeof defaultImpactFactors)[0]) => {
    const currentValue = factorWeights[factor.id] !== undefined ? factorWeights[factor.id] : factor.defaultWeight

    return (
      <div key={factor.id} className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIconComponent(factor.icon)}
            <span className="font-medium">{factor.name}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                    <Info className="h-3 w-3" />
                    <span className="sr-only">Info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{factor.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-medium">{currentValue}%</span>
        </div>
        <Slider
          value={[currentValue]}
          min={0}
          max={100}
          step={5}
          onValueChange={(value) => onFactorChange(factor.id, value)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Your Impact Factors</h2>
        <p className="text-muted-foreground mt-2">
          These settings determine how we prioritize news for you. Adjust the sliders to customize.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div
          className={`cursor-pointer rounded-lg border p-4 ${activeTab === "market" ? "border-primary" : ""}`}
          onClick={() => setActiveTab("market")}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Market</h3>
            </div>
            <span className="text-lg font-bold">{marketAvg}%</span>
          </div>
        </div>

        <div
          className={`cursor-pointer rounded-lg border p-4 ${activeTab === "technical" ? "border-primary" : ""}`}
          onClick={() => setActiveTab("technical")}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Technical</h3>
            </div>
            <span className="text-lg font-bold">{technicalAvg}%</span>
          </div>
        </div>

        <div
          className={`cursor-pointer rounded-lg border p-4 ${activeTab === "personal" ? "border-primary" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Personal</h3>
            </div>
            <span className="text-lg font-bold">{personalAvg}%</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="mt-4">
          {marketFactors.map(renderFactorSlider)}
        </TabsContent>

        <TabsContent value="technical" className="mt-4">
          {technicalFactors.map(renderFactorSlider)}
        </TabsContent>

        <TabsContent value="personal" className="mt-4">
          {personalFactors.map(renderFactorSlider)}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button onClick={onComplete} disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? (
            <>Saving...</>
          ) : (
            <>
              Complete Setup
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
