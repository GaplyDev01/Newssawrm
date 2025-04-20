"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface InterestSelectionProps {
  selectedInterests: string[]
  onSelect: (interests: string[]) => void
  onNext: () => void
}

export function InterestSelection({ selectedInterests, onSelect, onNext }: InterestSelectionProps) {
  const interests = [
    { id: "defi", name: "DeFi" },
    { id: "nfts", name: "NFTs" },
    { id: "layer2", name: "Layer 2 Solutions" },
    { id: "regulation", name: "Regulation" },
    { id: "bitcoin", name: "Bitcoin" },
    { id: "ethereum", name: "Ethereum" },
    { id: "altcoins", name: "Altcoins" },
    { id: "dao", name: "DAOs" },
    { id: "metaverse", name: "Metaverse" },
    { id: "web3", name: "Web3" },
    { id: "security", name: "Security" },
    { id: "privacy", name: "Privacy" },
  ]

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      onSelect(selectedInterests.filter((i) => i !== id))
    } else {
      onSelect([...selectedInterests, id])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Select Your Interests</h2>
        <p className="text-muted-foreground mt-2">
          Choose topics that interest you most. This will help us fine-tune your impact factors.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        {interests.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id)
          return (
            <Badge
              key={interest.id}
              variant={isSelected ? "default" : "outline"}
              className={`text-sm py-2 px-3 cursor-pointer ${isSelected ? "bg-primary" : "hover:bg-primary/10"}`}
              onClick={() => toggleInterest(interest.id)}
            >
              {isSelected && <Check className="mr-1 h-3 w-3" />}
              {interest.name}
            </Badge>
          )
        })}
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={onNext} disabled={selectedInterests.length === 0} className="w-full md:w-auto">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
