"use client"

import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { SetupWizardButton } from "@/components/onboarding/setup-wizard-button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface IntelligenceProfileProps {
  profile: any
}

export function IntelligenceProfile({ profile }: IntelligenceProfileProps) {
  const router = useRouter()
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

        // If no preferences or no impact factors configured, show the setup button
        const hasFactors = userPrefs?.preferences?.impactFactors !== undefined
        setHasConfiguredFactors(hasFactors)
      } catch (error) {
        console.error("Error checking user preferences:", error)
      }
    }

    checkUserPreferences()
  }, [])

  const handleEditProfile = () => {
    router.push("/settings")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md">Your Intelligence Profile</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleEditProfile}>
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="space-y-4">
          <div>
            <p className="font-medium">Industry Focus</p>
            <p className="text-muted-foreground">{profile?.intelligence_profile?.market_focus || "Web3"}</p>
          </div>

          <div>
            <p className="font-medium">Top Interests</p>
            <p className="text-muted-foreground">
              {profile?.intelligence_profile?.interests?.length > 0
                ? profile.intelligence_profile.interests.join(", ")
                : "Layer 2 Solutions, Ethereum, ICOs/IDOs"}
            </p>
          </div>

          <div>
            <p className="font-medium">Monitored Entities</p>
            <p className="text-muted-foreground">
              {profile?.intelligence_profile?.monitored_entities?.length > 0
                ? profile.intelligence_profile.monitored_entities.join(", ")
                : "1 entities"}
            </p>
          </div>

          {hasConfiguredFactors ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push("/settings/impact-factors")}
            >
              Adjust Impact Factors
            </Button>
          ) : (
            <SetupWizardButton variant="default" size="sm" className="w-full">
              Configure Impact Factors
            </SetupWizardButton>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
