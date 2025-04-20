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

export function FilterButton() {
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
          <DropdownMenuItem>High Impact</DropdownMenuItem>
          <DropdownMenuItem>Moderate Impact</DropdownMenuItem>
          <DropdownMenuItem>Low Impact</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs">Category</DropdownMenuLabel>
          <DropdownMenuItem>Cryptocurrency</DropdownMenuItem>
          <DropdownMenuItem>DeFi</DropdownMenuItem>
          <DropdownMenuItem>NFTs</DropdownMenuItem>
          <DropdownMenuItem>Regulation</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs">Time Period</DropdownMenuLabel>
          <DropdownMenuItem>Today</DropdownMenuItem>
          <DropdownMenuItem>This Week</DropdownMenuItem>
          <DropdownMenuItem>This Month</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
