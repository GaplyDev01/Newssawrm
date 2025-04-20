import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface ArticlePerformanceProps {
  topArticles: any[]
  articleViews: any[]
}

export function ArticlePerformance({ topArticles, articleViews }: ArticlePerformanceProps) {
  // Create a map of article IDs to view counts
  const viewCountMap = articleViews.reduce(
    (map, item) => {
      map[item.article_id] = Number.parseInt(item.count)
      return map
    },
    {} as Record<string, number>,
  )

  // Sort articles by view count
  const sortedArticles = [...topArticles].sort((a, b) => {
    const viewsA = viewCountMap[a.id] || 0
    const viewsB = viewCountMap[b.id] || 0
    return viewsB - viewsA
  })

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Top Performing Articles</CardTitle>
        <CardDescription>Articles with the highest view counts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No article data available</p>
          ) : (
            sortedArticles.slice(0, 5).map((article) => (
              <div key={article.id} className="flex items-start justify-between">
                <div className="space-y-1">
                  <Link href={`/article/${article.id}`} className="font-medium hover:underline">
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
                  <Badge variant="secondary">{viewCountMap[article.id] || 0} views</Badge>
                  {article.category && <Badge variant="outline">{article.category}</Badge>}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
