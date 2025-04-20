import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface RelatedArticle {
  id: string
  title: string
  summary: string | null
  published_at: string | null
  category: string | null
  impact_score: number
  news_sources: {
    name: string | null
  } | null
}

interface RelatedArticlesProps {
  articles: RelatedArticle[]
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  const getImpactLabel = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 50) return "Moderate"
    return "Low"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Related Articles</CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No related articles found</p>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Link key={article.id} href={`/article/${article.id}`} className="block">
                <div className="rounded-md p-3 hover:bg-muted transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {article.news_sources?.name || "Unknown Source"}
                      {article.published_at && (
                        <> • {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</>
                      )}
                    </span>
                    <Badge
                      variant={
                        getImpactLabel(article.impact_score) === "High"
                          ? "destructive"
                          : getImpactLabel(article.impact_score) === "Moderate"
                            ? "default"
                            : "secondary"
                      }
                      className="text-[10px] px-1 py-0"
                    >
                      {getImpactLabel(article.impact_score)}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium line-clamp-2">{article.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
