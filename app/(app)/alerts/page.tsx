import { createClient } from "@/lib/supabase-server"
import { AlertsList } from "@/components/alerts/alerts-list"
import { CreateAlertButton } from "@/components/alerts/create-alert-button"
import { redirect } from "next/navigation"

export default async function AlertsPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the user's alerts
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get the user's alert notifications
  const { data: notifications } = await supabase
    .from("alert_notifications")
    .select(`
      *,
      alerts (
        name
      ),
      news_articles (
        id,
        title,
        published_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <CreateAlertButton />
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          <AlertsList alerts={alerts || []} notifications={notifications || []} />
        </div>
      </div>
    </div>
  )
}
