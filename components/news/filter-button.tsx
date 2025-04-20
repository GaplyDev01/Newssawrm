"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function FilterButton() {
  const router = useRouter()

  const handleFilterSelect = (filter: string, value: string) => {
    // In a real app, this would apply filters to the current view
    console.log(`Filter selected: ${filter}=${value}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs">Impact</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleFilterSelect("impact", "high")}>High Impact</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterSelect("impact", "moderate")}>Moderate Impact</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterSelect("impact", "low")}>Low Impact</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs">Category</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleFilterSelect("category", "cryptocurrency")}>
            Cryptocurrency
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterSelect("category", "defi")}>DeFi</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterSelect("category", "nfts")}>NFTs</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterSelect("category", "ethereum")}>Ethereum</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs">Time Period</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleFilterSelect("time", "today")}>Today</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterSelect("time", "week")}>This Week</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFilterSelect("time", "month")}>This Month</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
