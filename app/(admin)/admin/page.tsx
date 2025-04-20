import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { AdminStats } from "@/components/admin/admin-stats"
import { RecentArticles } from "@/components/admin/recent-articles"
import { UserActivity } from "@/components/admin/user-activity"
import { ErrorLogs } from "@/components/admin/error-logs"

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the user's profile to check if they're an admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/feed")
  }

  // Get stats
  const { data: articleCount } = await supabase.from("news_articles").select("id", { count: "exact", head: true })

  const { data: userCount } = await supabase.from("profiles").select("id", { count: "exact", head: true })

  const { data: alertCount } = await supabase.from("alerts").select("id", { count: "exact", head: true })

  const { data: errorCount } = await supabase.from("error_logs").select("id", { count: "exact", head: true })

  // Get recent articles
  const { data: recentArticles } = await supabase
    .from("news_articles")
    .select(`
      id,
      title,
      published_at,
      category,
      impact_score,
      news_sources (
        name
      )
    `)
    .order("published_at", { ascending: false })
    .limit(5)

  // Get user activity
  const { data: userActivity } = await supabase
    .from("user_reading_events")
    .select(`
      id,
      user_id,
      article_id,
      event_type,
      created_at,
      profiles (
        full_name
      ),
      news_articles (
        title
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get error logs
  const { data: errorLogs } = await supabase
    .from("error_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(5)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your news platform</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AdminStats
            articleCount={articleCount?.length || 0}
            userCount={userCount?.length || 0}
            alertCount={alertCount?.length || 0}
            errorCount={errorCount?.length || 0}
          />
        </div>

        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <RecentArticles articles={recentArticles || []} />
          <UserActivity activities={userActivity || []} />
        </div>

        <div className="mt-4">
          <ErrorLogs errors={errorLogs || []} />
        </div>
      </div>
    </div>
  )
}
