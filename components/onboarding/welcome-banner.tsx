"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SetupWizardButton } from "@/components/onboarding/setup-wizard-button"
import { supabase } from "@/lib/supabase-client"

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasConfiguredFactors, setHasConfiguredFactors] = useState(true)

  useEffect(() => {
    const checkUserPreferences = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Check if user has configured impact factors
        const { data: userPrefs } = await supabase
          .from("user_preferences")
          .select("preferences")
          .eq("user_id", user.id)
          .single()

        // If no preferences or no impact factors configured, show the banner
        const hasFactors = userPrefs?.preferences?.impactFactors !== undefined
        setHasConfiguredFactors(hasFactors)
        setIsVisible(!hasFactors)
      } catch (error) {
        console.error("Error checking user preferences:", error)
      }
    }

    checkUserPreferences()
  }, [])

  if (!isVisible) return null

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Welcome to CryptoIntel!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Personalize your news experience by configuring your impact factors.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <SetupWizardButton variant="default">Start Setup Wizard</SetupWizardButton>

            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
