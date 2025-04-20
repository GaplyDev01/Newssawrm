"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

interface Alert {
  id: string
  name: string
  description: string | null
  alert_type: string
  criteria: any
  is_active: boolean
  created_at: string
}

interface AlertsListProps {
  alerts: Alert[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [userAlerts, setUserAlerts] = useState(alerts)

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await supabase.from("alerts").delete().eq("id", alertId)

      setUserAlerts(userAlerts.filter((alert) => alert.id !== alertId))

      toast({
        title: "Alert deleted",
        description: "Alert has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting alert:", error)
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      })
    }
  }

  const handleEditAlert = async (alertId: string) => {
    // In a real app, this would open a modal or navigate to an edit page
    toast({
      title: "Edit Alert",
      description: "This functionality is not implemented in the demo",
    })
  }

  const getAlertDescription = (alert: Alert) => {
    switch (alert.alert_type) {
      case "price_movement":
        return `Price drops below ${alert.criteria.lower_threshold} or rises above ${alert.criteria.upper_threshold}`
      case "news_mention":
        return `Any news mentioning "${alert.criteria.keywords.join('" and "')}"`
      case "trading_volume":
        return `Trading volume exceeds ${alert.criteria.threshold}% of 30-day average`
      default:
        return alert.description || "No description"
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Active Alerts</h2>
      </div>

      <div className="space-y-4">
        {userAlerts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No active alerts</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                // In a real app, this would open a modal to create an alert
                toast({
                  title: "Create Alert",
                  description: "This functionality is not fully implemented in the demo",
                })
              }}
            >
              Create Your First Alert
            </Button>
          </div>
        ) : (
          userAlerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{alert.name}</h3>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditAlert(alert.id)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAlert(alert.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{getAlertDescription(alert)}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
