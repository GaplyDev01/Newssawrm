import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { AnalyticsOverview } from "@/components/analytics/analytics-overview"
import { ArticlePerformance } from "@/components/analytics/article-performance"
import { UserEngagement } from "@/components/analytics/user-engagement"
import { SearchAnalytics } from "@/components/analytics/search-analytics"

export default async function AnalyticsPage() {
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

  // Get article view counts
  const { data: articleViews } = await supabase
    .from("user_reading_events")
    .select("article_id, count")
    .eq("event_type", "view")
    .group("article_id")
    .order("count", { ascending: false })
    .limit(10)

  // Get top saved articles
  const { data: savedArticles } = await supabase
    .from("saved_articles")
    .select("article_id, count")
    .group("article_id")
    .order("count", { ascending: false })
    .limit(10)

  // Get user engagement by event type
  const { data: userEngagement } = await supabase
    .from("user_reading_events")
    .select("event_type, count")
    .group("event_type")
    .order("count", { ascending: false })

  // Get article details for the top viewed articles
  const articleIds = articleViews?.map((view) => view.article_id) || []
  const { data: topArticles } = await supabase
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
    .in("id", articleIds)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track user engagement and content performance</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <AnalyticsOverview
          articleViews={articleViews || []}
          savedArticles={savedArticles || []}
          userEngagement={userEngagement || []}
        />

        <div className="grid gap-4 mt-8 md:grid-cols-2">
          <ArticlePerformance topArticles={topArticles || []} articleViews={articleViews || []} />
          <UserEngagement userEngagement={userEngagement || []} />
        </div>

        <div className="mt-8">
          <SearchAnalytics />
        </div>
      </div>
    </div>
  )
}
