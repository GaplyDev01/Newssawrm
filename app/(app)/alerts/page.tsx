import { createClient } from "@/lib/supabase-server"
import { AlertsList } from "@/components/alerts/alerts-list"
import { AlertTemplates } from "@/components/alerts/alert-templates"
import { NotificationsList } from "@/components/alerts/notifications-list"
import { DeliverySettings } from "@/components/alerts/delivery-settings"

export default async function AlertsPage() {
  const supabase = createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's alerts
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  // Get recent notifications
  const { data: notifications } = await supabase
    .from("alert_notifications")
    .select(`
      *,
      alerts (
        name,
        alert_type
      ),
      news_articles (
        title
      )
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get user preferences
  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user?.id).single()

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-muted-foreground mt-1">Real-time notifications for important market events</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4 space-y-6">
          <AlertsList alerts={alerts || []} />
          <NotificationsList notifications={notifications || []} />
        </div>

        <div className="w-80 border-l overflow-auto p-4 space-y-6">
          <AlertTemplates />
          <DeliverySettings preferences={preferences} />
        </div>
      </div>
    </div>
  )
}
