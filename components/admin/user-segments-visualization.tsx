"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"

export function UserSegmentsVisualization() {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    editorUsers: 0,
    regularUsers: 0,
    activeAlerts: 0,
    savedArticles: 0,
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true)

        // Get total users
        const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

        // Get admin users
        const { count: adminUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin")

        // Get editor users
        const { count: editorUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "editor")

        // Get active alerts
        const { count: activeAlerts } = await supabase
          .from("alerts")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)

        // Get saved articles
        const { count: savedArticles } = await supabase
          .from("saved_articles")
          .select("*", { count: "exact", head: true })

        setUserStats({
          totalUsers: totalUsers || 0,
          adminUsers: adminUsers || 0,
          editorUsers: editorUsers || 0,
          regularUsers: (totalUsers || 0) - (adminUsers || 0) - (editorUsers || 0),
          activeAlerts: activeAlerts || 0,
          savedArticles: savedArticles || 0,
        })
      } catch (error) {
        console.error("Error fetching user stats:", error)
        toast({
          title: "Error",
          description: "Failed to load user statistics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [toast])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">Loading user statistics...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Segments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary/10 rounded-lg p-4">
            <h3 className="text-lg font-medium">User Roles</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Admin Users</span>
                <span className="font-medium">{userStats.adminUsers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${userStats.totalUsers ? (userStats.adminUsers / userStats.totalUsers) * 100 : 0}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between">
                <span>Editor Users</span>
                <span className="font-medium">{userStats.editorUsers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-yellow-500 h-2.5 rounded-full"
                  style={{
                    width: `${userStats.totalUsers ? (userStats.editorUsers / userStats.totalUsers) * 100 : 0}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between">
                <span>Regular Users</span>
                <span className="font-medium">{userStats.regularUsers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{
                    width: `${userStats.totalUsers ? (userStats.regularUsers / userStats.totalUsers) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4">
            <h3 className="text-lg font-medium">User Engagement</h3>
            <div className="mt-4">
              <div className="text-3xl font-bold">{userStats.savedArticles}</div>
              <div className="text-sm text-muted-foreground">Total saved articles</div>

              <div className="mt-4">
                <div className="text-3xl font-bold">
                  {(userStats.savedArticles / Math.max(userStats.totalUsers, 1)).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Average saved articles per user</div>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-4">
            <h3 className="text-lg font-medium">Alert Usage</h3>
            <div className="mt-4">
              <div className="text-3xl font-bold">{userStats.activeAlerts}</div>
              <div className="text-sm text-muted-foreground">Active alerts</div>

              <div className="mt-4">
                <div className="text-3xl font-bold">
                  {(userStats.activeAlerts / Math.max(userStats.totalUsers, 1)).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Average alerts per user</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
