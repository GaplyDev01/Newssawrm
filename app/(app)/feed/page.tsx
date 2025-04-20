import { createClient } from "@/lib/supabase-server"
import { NewsFeed } from "@/components/news/news-feed"
import { SearchBar } from "@/components/news/search-bar"
import { FilterButton } from "@/components/news/filter-button"
import { RefreshButton } from "@/components/news/refresh-button"

export default async function FeedPage() {
  const supabase = createClient()

  // Get user profile
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  // Get recent news articles
  const { data: articles } = await supabase
    .from("news_articles")
    .select(`
      *,
      news_sources (
        name,
        logo_url
      )
    `)
    .order("published_at", { ascending: false })
    .limit(10)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Your Intelligence Feed</h1>
        <div className="flex items-center gap-2">
          <SearchBar />
          <FilterButton />
          <RefreshButton />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <NewsFeed articles={articles || []} />
      </div>
    </div>
  )
}
