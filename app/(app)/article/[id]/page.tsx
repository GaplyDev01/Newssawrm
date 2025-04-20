import { notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { ArticleHeader } from "@/components/article/article-header"
import { ArticleContent } from "@/components/article/article-content"
import { ArticleActions } from "@/components/article/article-actions"
import { RelatedArticles } from "@/components/article/related-articles"
import { DetailedImpactAnalysis } from "@/components/article/detailed-impact-analysis"
import { FeedbackReminder } from "@/components/article/feedback-reminder"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BarChart2 } from "lucide-react"

export default async function ArticlePage({ params }: { params: { id: string } }) {
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

  // Fetch the article with its source
  const { data: article, error } = await supabase
    .from("news_articles")
    .select(`
      *,
      news_sources (
        name,
        logo_url,
        url
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !article) {
    console.error("Error fetching article:", error)
    notFound()
  }

  // Fetch related articles based on category
  const { data: relatedArticles } = await supabase
    .from("news_articles")
    .select(`
      id,
      title,
      summary,
      published_at,
      category,
      impact_score,
      news_sources (
        name
      )
    `)
    .eq("category", article.category)
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ArticleHeader article={article} />

          <div className="flex justify-end mt-4">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              View Impact Analysis
            </Button>
          </div>

          <FeedbackReminder />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="md:col-span-2">
              <ArticleContent article={article} />
              <Separator className="my-8" />
              <ArticleActions article={article} />
            </div>

            <div className="space-y-8">
              <DetailedImpactAnalysis article={article} />
              <RelatedArticles articles={relatedArticles || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
