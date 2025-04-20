"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export function DailyBriefing() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Daily Briefing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">Get a daily summary of the most important crypto developments</p>
        <Button className="w-full" variant="default">
          <FileText className="mr-2 h-4 w-4" />
          Generate Briefing
        </Button>
      </CardContent>
    </Card>
  )
}
