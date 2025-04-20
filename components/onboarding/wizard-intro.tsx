"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, Zap, Settings } from "lucide-react"

interface WizardIntroProps {
  onNext: () => void
}

export function WizardIntro({ onNext }: WizardIntroProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <BarChart2 className="h-10 w-10 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center">Welcome to Impact Factor Setup</h2>

      <p className="text-center text-muted-foreground">
        Let's personalize your news experience by configuring your impact factors. This will help us prioritize content
        that matters most to you.
      </p>

      <div className="grid gap-4 mt-8">
        <div className="flex items-start gap-4 rounded-lg border p-4">
          <div className="rounded-full bg-primary/10 p-2">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Personalized News Prioritization</h3>
            <p className="text-sm text-muted-foreground">
              Impact factors determine which news and developments deserve your immediate attention.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg border p-4">
          <div className="rounded-full bg-primary/10 p-2">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Customizable Weights</h3>
            <p className="text-sm text-muted-foreground">
              Adjust how much each factor influences your overall impact scores.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-lg border p-4">
          <div className="rounded-full bg-primary/10 p-2">
            <BarChart2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Intelligent Filtering</h3>
            <p className="text-sm text-muted-foreground">
              Focus on what truly matters by filtering out low-impact noise.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={onNext} className="w-full md:w-auto">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
