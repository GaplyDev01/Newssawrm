"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TrendingTopics() {
  const topics = ["ETF Approval", "Regulation", "Layer 2"]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Badge key={topic} variant="secondary" className="cursor-pointer">
              {topic}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
