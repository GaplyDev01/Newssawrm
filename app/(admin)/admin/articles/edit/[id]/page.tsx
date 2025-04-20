import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ArticleForm } from "@/components/admin/article-form"
import type { Database } from "@/lib/database.types"

export default async function EditArticlePage({ params }: { params: { id: string } }) {
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

  // Fetch the article
  const { data: article, error } = await supabase.from("news_articles").select("*").eq("id", params.id).single()

  if (error || !article) {
    notFound()
  }

  // Fetch news sources for the dropdown
  const { data: sources } = await supabase.from("news_sources").select("id, name").order("name")

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Edit Article</h1>
        <p className="text-muted-foreground mt-1">Update article details</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <ArticleForm article={article} sources={sources || []} mode="edit" />
      </div>
    </div>
  )
}
