"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { ImpactFactorWizard } from "@/components/onboarding/impact-factor-wizard"
import { Settings } from "lucide-react"

interface SetupWizardButtonProps extends ButtonProps {
  showIcon?: boolean
  initialStep?: number
}

export function SetupWizardButton({ children, showIcon = true, initialStep = 0, ...props }: SetupWizardButtonProps) {
  const [showWizard, setShowWizard] = useState(false)

  return (
    <>
      <Button onClick={() => setShowWizard(true)} {...props}>
        {showIcon && <Settings className="mr-2 h-4 w-4" />}
        {children || "Configure Impact Factors"}
      </Button>

      {showWizard && <ImpactFactorWizard onClose={() => setShowWizard(false)} initialStep={initialStep} />}
    </>
  )
}
