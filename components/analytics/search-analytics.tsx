"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function SearchAnalytics() {
  const [searchData, setSearchData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSearchData = async () => {
      setIsLoading(true)
      try {
        // This is a mock implementation since we don't have a real search_logs table
        // In a real application, you would fetch actual search analytics data

        // Simulate fetching search data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data for demonstration
        const mockData = [
          { query: "Bitcoin", count: 42 },
          { query: "Ethereum", count: 38 },
          { query: "NFT", count: 27 },
          { query: "DeFi", count: 25 },
          { query: "Blockchain", count: 23 },
          { query: "Crypto", count: 21 },
          { query: "Web3", count: 18 },
          { query: "Metaverse", count: 15 },
          { query: "Mining", count: 12 },
          { query: "Wallet", count: 10 },
        ]

        setSearchData(mockData)
      } catch (error) {
        console.error("Error fetching search data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Analytics</CardTitle>
        <CardDescription>Most popular search queries</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <p className="text-sm text-muted-foreground">Loading search data...</p>
          </div>
        ) : searchData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No search data available</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={searchData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="query" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Search Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
