"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, BarChart2 } from "lucide-react"

interface WizardCompleteProps {
  onFinish: () => void
}

export function WizardComplete({ onFinish }: WizardCompleteProps) {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center h-full">
      <div className="rounded-full bg-primary/10 p-6">
        <CheckCircle className="h-16 w-16 text-primary" />
      </div>

      <h2 className="text-2xl font-bold text-center">Setup Complete!</h2>

      <p className="text-center text-muted-foreground max-w-md">
        Your impact factors have been configured successfully. You'll now see news and information prioritized according
        to your preferences.
      </p>

      <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
        <BarChart2 className="h-5 w-5 text-primary" />
        <p className="text-sm">You can adjust your impact factors anytime from the Settings page.</p>
      </div>

      <Button onClick={onFinish} className="mt-4">
        Go to News Feed
      </Button>
    </div>
  )
}
