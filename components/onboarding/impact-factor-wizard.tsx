"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { defaultImpactFactors } from "@/lib/types/impact-score"
import { saveImpactPreferences } from "@/lib/actions/impact-preferences-actions"
import { ArrowLeft } from "lucide-react"
import { WizardIntro } from "@/components/onboarding/wizard-intro"
import { UserTypeSelection } from "@/components/onboarding/user-type-selection"
import { InterestSelection } from "@/components/onboarding/interest-selection"
import { FactorReview } from "@/components/onboarding/factor-review"
import { WizardComplete } from "@/components/onboarding/wizard-complete"

interface ImpactFactorWizardProps {
  onClose: () => void
  initialStep?: number
}

export function ImpactFactorWizard({ onClose, initialStep = 0 }: ImpactFactorWizardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // User selections
  const [userType, setUserType] = useState<string>("")
  const [interests, setInterests] = useState<string[]>([])
  const [factorWeights, setFactorWeights] = useState<Record<string, number>>(() => {
    // Initialize with default weights
    return defaultImpactFactors.reduce(
      (acc, factor) => {
        acc[factor.id] = factor.defaultWeight
        return acc
      },
      {} as Record<string, number>,
    )
  })

  // Total number of steps in the wizard
  const totalSteps = 5

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      // Save the user's factor weights
      const result = await saveImpactPreferences(factorWeights)

      if (result.success) {
        toast({
          title: "Setup Complete",
          description: "Your impact factor preferences have been saved.",
        })

        // Move to the completion step
        setCurrentStep(totalSteps - 1)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = () => {
    router.push("/feed")
    onClose()
  }

  // Update factor weights based on user type
  const updateFactorsByUserType = (type: string) => {
    setUserType(type)

    let updatedWeights = { ...factorWeights }

    switch (type) {
      case "trader":
        // Traders care more about market factors and less about technical details
        updatedWeights = {
          ...updatedWeights,
          market_volatility: 95,
          trading_volume: 90,
          regulatory_implications: 85,
          technology_advancement: 60,
          network_security: 70,
          adoption_metrics: 65,
          portfolio_relevance: 100,
          industry_focus: 80,
          geographic_relevance: 50,
        }
        break
      case "developer":
        // Developers care more about technical factors
        updatedWeights = {
          ...updatedWeights,
          market_volatility: 60,
          trading_volume: 50,
          regulatory_implications: 75,
          technology_advancement: 100,
          network_security: 95,
          adoption_metrics: 85,
          portfolio_relevance: 70,
          industry_focus: 80,
          geographic_relevance: 40,
        }
        break
      case "investor":
        // Investors care about long-term factors
        updatedWeights = {
          ...updatedWeights,
          market_volatility: 75,
          trading_volume: 70,
          regulatory_implications: 90,
          technology_advancement: 85,
          network_security: 80,
          adoption_metrics: 95,
          portfolio_relevance: 100,
          industry_focus: 85,
          geographic_relevance: 60,
        }
        break
      case "analyst":
        // Analysts want balanced information
        updatedWeights = {
          ...updatedWeights,
          market_volatility: 85,
          trading_volume: 80,
          regulatory_implications: 90,
          technology_advancement: 85,
          network_security: 80,
          adoption_metrics: 85,
          portfolio_relevance: 75,
          industry_focus: 90,
          geographic_relevance: 70,
        }
        break
    }

    setFactorWeights(updatedWeights)
  }

  // Update factor weights based on interests
  const updateFactorsByInterests = (selectedInterests: string[]) => {
    setInterests(selectedInterests)

    // Adjust weights based on interests
    // This is a simplified example - in a real app, you might have more sophisticated logic
    const updatedWeights = { ...factorWeights }

    if (selectedInterests.includes("defi")) {
      updatedWeights.market_volatility = Math.min(100, updatedWeights.market_volatility + 10)
      updatedWeights.trading_volume = Math.min(100, updatedWeights.trading_volume + 15)
    }

    if (selectedInterests.includes("nfts")) {
      updatedWeights.adoption_metrics = Math.min(100, updatedWeights.adoption_metrics + 15)
      updatedWeights.industry_focus = Math.min(100, updatedWeights.industry_focus + 10)
    }

    if (selectedInterests.includes("layer2")) {
      updatedWeights.technology_advancement = Math.min(100, updatedWeights.technology_advancement + 20)
      updatedWeights.network_security = Math.min(100, updatedWeights.network_security + 10)
    }

    if (selectedInterests.includes("regulation")) {
      updatedWeights.regulatory_implications = Math.min(100, updatedWeights.regulatory_implications + 25)
      updatedWeights.geographic_relevance = Math.min(100, updatedWeights.geographic_relevance + 15)
    }

    setFactorWeights(updatedWeights)
  }

  // Update individual factor weight
  const handleFactorChange = (factorId: string, value: number[]) => {
    setFactorWeights((prev) => ({
      ...prev,
      [factorId]: value[0],
    }))
  }

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WizardIntro onNext={handleNext} />
      case 1:
        return <UserTypeSelection selectedType={userType} onSelect={updateFactorsByUserType} onNext={handleNext} />
      case 2:
        return (
          <InterestSelection selectedInterests={interests} onSelect={updateFactorsByInterests} onNext={handleNext} />
        )
      case 3:
        return (
          <FactorReview
            factorWeights={factorWeights}
            onFactorChange={handleFactorChange}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
        )
      case 4:
        return <WizardComplete onFinish={handleFinish} />
      default:
        return <WizardIntro onNext={handleNext} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configure Your Impact Factors</CardTitle>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardHeader>

        <CardContent className="min-h-[400px]">{renderStep()}</CardContent>

        <CardFooter className="flex justify-between border-t p-4">
          {currentStep > 0 && currentStep < totalSteps - 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          {currentStep === 0 && (
            <Button variant="outline" onClick={onClose}>
              Skip for now
            </Button>
          )}
          <div></div> {/* Spacer for flex layout */}
        </CardFooter>
      </Card>
    </div>
  )
}
