import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SavedArticlesList } from "@/components/news/saved-articles-list"

export default async function SavedArticlesPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get saved articles
  const { data: savedArticles } = await supabase
    .from("saved_articles")
    .select(`
      id,
      created_at,
      news_articles (
        id,
        title,
        content,
        summary,
        published_at,
        url,
        image_url,
        category,
        tags,
        impact_score,
        news_sources (
          name,
          logo_url
        )
      )
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Saved Articles</h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <SavedArticlesList savedArticles={savedArticles || []} />
      </div>
    </div>
  )
}
