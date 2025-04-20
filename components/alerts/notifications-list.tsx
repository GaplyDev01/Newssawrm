"use client"

import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, TrendingUp, FileText, BarChart } from "lucide-react"

interface Notification {
  id: string
  message: string
  is_read: boolean
  created_at: string
  alerts: {
    name: string
    alert_type: string
  } | null
  news_articles: {
    title: string
  } | null
}

interface NotificationsListProps {
  notifications: Notification[]
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const getIcon = (alertType: string | undefined) => {
    switch (alertType) {
      case "price_movement":
        return <TrendingUp className="h-5 w-5" />
      case "news_mention":
        return <FileText className="h-5 w-5" />
      case "trading_volume":
        return <BarChart className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-md ${notification.is_read ? "" : "bg-muted"}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {getIcon(notification.alerts?.alert_type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.alerts?.name || "Alert Notification"}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
