import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface RecentArticlesProps {
  articles: any[]
}

export function RecentArticles({ articles }: RecentArticlesProps) {
  const getImpactLabel = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 50) return "Moderate"
    return "Low"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Articles</CardTitle>
        <CardDescription>Latest articles added to the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No articles found</p>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Link href={`/admin/articles/${article.id}`} className="font-medium hover:underline">
                    {article.title}
                  </Link>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{article.news_sources?.name || "Unknown Source"}</span>
                    <span className="mx-1">•</span>
                    <span>
                      {article.published_at
                        ? formatDistanceToNow(new Date(article.published_at), {
                            addSuffix: true,
                          })
                        : "Unknown date"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {article.category && <Badge variant="outline">{article.category}</Badge>}
                  <Badge
                    variant={
                      getImpactLabel(article.impact_score) === "High"
                        ? "destructive"
                        : getImpactLabel(article.impact_score) === "Moderate"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {getImpactLabel(article.impact_score)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
