"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bell, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { EditAlertDialog } from "@/components/alerts/edit-alert-dialog"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"

interface AlertsListProps {
  alerts: any[]
  notifications: any[]
}

export function AlertsList({ alerts, notifications }: AlertsListProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [editingAlert, setEditingAlert] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    setIsUpdating(alertId)

    try {
      const { error } = await supabase
        .from("alerts")
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq("id", alertId)

      if (error) throw error

      toast({
        title: isActive ? "Alert disabled" : "Alert enabled",
        description: isActive
          ? "You will no longer receive notifications for this alert."
          : "You will now receive notifications for this alert.",
      })
    } catch (error: any) {
      console.error("Error toggling alert:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the alert.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase.from("alerts").delete().eq("id", alertId)

      if (error) throw error

      toast({
        title: "Alert deleted",
        description: "The alert has been deleted successfully.",
      })
    } catch (error: any) {
      console.error("Error deleting alert:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the alert.",
        variant: "destructive",
      })
    }
  }

  const handleEditAlert = (alert: any) => {
    setEditingAlert(alert)
    setIsEditDialogOpen(true)
  }

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "price_movement":
        return "Price Movement"
      case "news_mention":
        return "News Mention"
      case "volume_spike":
        return "Volume Spike"
      case "regulatory_update":
        return "Regulatory Update"
      default:
        return type.replace("_", " ")
    }
  }

  return (
    <Tabs defaultValue="alerts" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="alerts">Your Alerts</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="alerts" className="mt-6">
        {alerts.length === 0 ? (
          <div className="text-center py-10">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No alerts yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first alert to get notified about important events.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{alert.name}</CardTitle>
                      <Badge variant={alert.is_active ? "default" : "secondary"}>
                        {alert.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                        disabled={isUpdating === alert.id}
                      >
                        {alert.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        <span className="sr-only">{alert.is_active ? "Disable alert" : "Enable alert"}</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditAlert(alert)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit alert</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete alert</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Alert</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this alert? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardDescription>{alert.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Alert Type</p>
                      <p className="text-sm text-muted-foreground">{getAlertTypeLabel(alert.alert_type)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium">Criteria</p>
                      <div className="mt-1 rounded-md bg-muted p-2">
                        <pre className="text-xs overflow-auto">{JSON.stringify(alert.criteria, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="notifications" className="mt-6">
        {notifications.length === 0 ? (
          <div className="text-center py-10">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No notifications yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Notifications will appear here when your alerts are triggered.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{notification.alerts?.name || "Alert Notification"}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{notification.message}</p>
                  {notification.news_articles && (
                    <Link
                      href={`/article/${notification.news_articles.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View article: {notification.news_articles.title}
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <EditAlertDialog alert={editingAlert} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </Tabs>
  )
}
