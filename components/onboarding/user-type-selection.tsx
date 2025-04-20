"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Code, Briefcase, LineChart } from "lucide-react"

interface UserTypeSelectionProps {
  selectedType: string
  onSelect: (type: string) => void
  onNext: () => void
}

export function UserTypeSelection({ selectedType, onSelect, onNext }: UserTypeSelectionProps) {
  const userTypes = [
    {
      id: "trader",
      name: "Trader",
      description: "I make frequent trades and need real-time market information",
      icon: TrendingUp,
    },
    {
      id: "developer",
      name: "Developer",
      description: "I build applications and need technical information",
      icon: Code,
    },
    {
      id: "investor",
      name: "Investor",
      description: "I make long-term investments and need strategic information",
      icon: Briefcase,
    },
    {
      id: "analyst",
      name: "Analyst",
      description: "I analyze market trends and need comprehensive data",
      icon: LineChart,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">What best describes you?</h2>
        <p className="text-muted-foreground mt-2">This helps us tailor your impact factors to your specific needs.</p>
      </div>

      <div className="grid gap-4 mt-6">
        {userTypes.map((type) => (
          <div
            key={type.id}
            className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
              selectedType === type.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
            }`}
            onClick={() => onSelect(type.id)}
          >
            <div className={`rounded-full p-2 ${selectedType === type.id ? "bg-primary/20" : "bg-muted"}`}>
              <type.icon className={`h-5 w-5 ${selectedType === type.id ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <h3 className="font-medium">{type.name}</h3>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={onNext} disabled={!selectedType} className="w-full md:w-auto">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
