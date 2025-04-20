import Link from "next/link"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ArticlesList } from "@/components/admin/articles-list"
import type { Database } from "@/lib/database.types"

export default async function ArticlesPage() {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
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

  // Get initial articles data with source name
  const { data: articles } = await supabase
    .from("news_articles")
    .select(`
      id, 
      title, 
      published_at, 
      category, 
      impact_score,
      source_id,
      news_sources (
        name
      )
    `)
    .order("published_at", { ascending: false })
    .limit(20)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-muted-foreground mt-1">Manage news articles</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <ArticlesList initialArticles={articles || []} />
      </div>
    </div>
  )
}
