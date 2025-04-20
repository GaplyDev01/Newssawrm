import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { ArticleForm } from "@/components/admin/article-form"
import type { Database } from "@/lib/database.types"

export default async function NewArticlePage() {
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

  // Fetch news sources for the dropdown
  const { data: sources } = await supabase.from("news_sources").select("id, name").order("name")

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Create New Article</h1>
        <p className="text-muted-foreground mt-1">Add a new article to the platform</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <ArticleForm sources={sources || []} mode="create" />
      </div>
    </div>
  )
}
