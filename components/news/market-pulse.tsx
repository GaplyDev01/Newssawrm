"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MarketPulse() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Market Pulse</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                B
              </div>
              <span>Bitcoin</span>
            </div>
            <div className="text-green-600">
              +2.4% <span className="text-xs">($63,245)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
