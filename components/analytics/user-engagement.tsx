"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface UserEngagementProps {
  userEngagement: any[]
}

export function UserEngagement({ userEngagement }: UserEngagementProps) {
  // Format the data for the pie chart
  const data = userEngagement.map((item) => ({
    name: formatEventType(item.event_type),
    value: Number.parseInt(item.count),
  }))

  // Colors for the pie chart
  const COLORS = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ec4899"]

  function formatEventType(type: string) {
    switch (type) {
      case "view":
        return "Views"
      case "save":
        return "Saves"
      case "unsave":
        return "Unsaves"
      case "like":
        return "Likes"
      case "share":
        return "Shares"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>User Engagement</CardTitle>
        <CardDescription>Breakdown of user interactions by type</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No engagement data available</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} interactions`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
