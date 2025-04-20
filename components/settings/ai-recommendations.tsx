"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecommendationFeedbackForm } from "./recommendation-feedback-form"
import { generateRecommendationId } from "@/app/actions/feedback"
import { toast } from "@/hooks/use-toast"

export function AiRecommendations() {
  const [enabled, setEnabled] = useState(true)
  const [diversityLevel, setDiversityLevel] = useState(50)
  const [recencyWeight, setRecencyWeight] = useState(70)
  const [relevanceWeight, setRelevanceWeight] = useState(80)
  const [recommendationId, setRecommendationId] = useState<string>("")

  useEffect(() => {
    const fetchRecommendationId = async () => {
      const id = await generateRecommendationId()
      setRecommendationId(id)
    }

    fetchRecommendationId()
  }, [])

  const handleSaveSettings = () => {
    // Save settings to database
    toast({
      title: "Settings saved",
      description: "Your AI recommendation settings have been updated.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Configure how the AI recommends news articles to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ai-recommendations">Enable AI Recommendations</Label>
              <p className="text-sm text-muted-foreground">Let our AI suggest articles based on your reading habits</p>
            </div>
            <Switch id="ai-recommendations" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <Tabs defaultValue="diversity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="diversity">Diversity</TabsTrigger>
              <TabsTrigger value="recency">Recency</TabsTrigger>
              <TabsTrigger value="relevance">Relevance</TabsTrigger>
            </TabsList>
            <TabsContent value="diversity" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="diversity-level">Content Diversity</Label>
                  <span className="text-sm text-muted-foreground">{diversityLevel}%</span>
                </div>
                <Slider
                  id="diversity-level"
                  min={0}
                  max={100}
                  step={5}
                  value={[diversityLevel]}
                  onValueChange={(value) => setDiversityLevel(value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Higher values introduce more variety in your recommendations
                </p>
              </div>
            </TabsContent>
            <TabsContent value="recency" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="recency-weight">Recency Weight</Label>
                  <span className="text-sm text-muted-foreground">{recencyWeight}%</span>
                </div>
                <Slider
                  id="recency-weight"
                  min={0}
                  max={100}
                  step={5}
                  value={[recencyWeight]}
                  onValueChange={(value) => setRecencyWeight(value[0])}
                />
                <p className="text-sm text-muted-foreground">Higher values prioritize newer articles</p>
              </div>
            </TabsContent>
            <TabsContent value="relevance" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="relevance-weight">Relevance Weight</Label>
                  <span className="text-sm text-muted-foreground">{relevanceWeight}%</span>
                </div>
                <Slider
                  id="relevance-weight"
                  min={0}
                  max={100}
                  step={5}
                  value={[relevanceWeight]}
                  onValueChange={(value) => setRelevanceWeight(value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Higher values prioritize articles more closely aligned with your interests
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendation Feedback</CardTitle>
          <CardDescription>Help us improve our recommendation system</CardDescription>
        </CardHeader>
        <CardContent>
          {recommendationId && <RecommendationFeedbackForm recommendationId={recommendationId} />}
        </CardContent>
      </Card>
    </div>
  )
}

export default AiRecommendations
