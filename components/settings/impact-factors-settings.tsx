"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import {
  BarChart2,
  TrendingUp,
  Shield,
  Cpu,
  Lock,
  Users,
  Briefcase,
  Target,
  Globe,
  RefreshCw,
  Info,
} from "lucide-react"
import { defaultImpactFactors, type ImpactFactor } from "@/lib/types/impact-score"
import {
  saveImpactPreferences,
  resetImpactPreferences,
  getUserImpactPreferences,
} from "@/lib/actions/impact-preferences-actions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ImpactFactorsSettings() {
  const { toast } = useToast()
  const [factorWeights, setFactorWeights] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true)
      try {
        const result = await getUserImpactPreferences()

        if (result.success && result.preferences) {
          setFactorWeights(result.preferences)
        } else {
          // Set defaults if no preferences found
          const defaults = defaultImpactFactors.reduce(
            (acc, factor) => {
              acc[factor.id] = factor.defaultWeight
              return acc
            },
            {} as Record<string, number>,
          )
          setFactorWeights(defaults)
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
        toast({
          title: "Error",
          description: "Failed to load your impact factor preferences",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [toast])

  // Handle slider change
  const handleFactorChange = (factorId: string, value: number[]) => {
    setFactorWeights((prev) => ({
      ...prev,
      [factorId]: value[0],
    }))
  }

  // Save preferences
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await saveImpactPreferences(factorWeights)

      if (result.success) {
        toast({
          title: "Preferences Saved",
          description: "Your impact factor preferences have been updated",
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save your preferences",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset to defaults
  const handleReset = async () => {
    setIsSaving(true)
    try {
      const result = await resetImpactPreferences()

      if (result.success) {
        // Update local state with defaults
        const defaults = defaultImpactFactors.reduce(
          (acc, factor) => {
            acc[factor.id] = factor.defaultWeight
            return acc
          },
          {} as Record<string, number>,
        )
        setFactorWeights(defaults)

        toast({
          title: "Preferences Reset",
          description: "Your impact factor preferences have been reset to defaults",
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error resetting preferences:", error)
      toast({
        title: "Error",
        description: "Failed to reset your preferences",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Group factors by category
  const marketFactors = defaultImpactFactors.filter((f) => f.category === "market")
  const technicalFactors = defaultImpactFactors.filter((f) => f.category === "technical")
  const personalFactors = defaultImpactFactors.filter((f) => f.category === "personal")

  // Calculate average score for each category
  const getAverageScore = (factors: ImpactFactor[]) => {
    if (factors.length === 0 || Object.keys(factorWeights).length === 0) return 0
    const sum = factors.reduce((acc, factor) => acc + (factorWeights[factor.id] || factor.defaultWeight), 0)
    return Math.round(sum / factors.length)
  }

  const marketAvg = getAverageScore(marketFactors)
  const technicalAvg = getAverageScore(technicalFactors)
  const personalAvg = getAverageScore(personalFactors)

  // Render factor slider
  const renderFactorSlider = (factor: ImpactFactor) => {
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
          onValueChange={(value) => handleFactorChange(factor.id, value)}
          disabled={isLoading || isSaving}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impact Factor Settings</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Impact Factors</CardTitle>
        <CardDescription>
          Adjust how different factors influence your impact scores. Higher percentages give more weight to that factor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            className={`cursor-pointer ${activeTab === "market" ? "border-primary" : ""}`}
            onClick={() => setActiveTab("market")}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Market</h3>
                </div>
                <span className="text-lg font-bold">{marketAvg}%</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer ${activeTab === "technical" ? "border-primary" : ""}`}
            onClick={() => setActiveTab("technical")}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Technical</h3>
                </div>
                <span className="text-lg font-bold">{technicalAvg}%</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer ${activeTab === "personal" ? "border-primary" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Personal</h3>
                </div>
                <span className="text-lg font-bold">{personalAvg}%</span>
              </div>
            </CardContent>
          </Card>
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isLoading || isSaving}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={isLoading || isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  )
}
