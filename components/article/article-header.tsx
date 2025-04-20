import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface ArticleHeaderProps {
  article: any
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  const getImpactLabel = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 50) return "Moderate"
    return "Low"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{article.category || "Uncategorized"}</Badge>
        <Badge
          variant={
            getImpactLabel(article.impact_score) === "High"
              ? "destructive"
              : getImpactLabel(article.impact_score) === "Moderate"
                ? "default"
                : "secondary"
          }
        >
          {getImpactLabel(article.impact_score)} Impact
        </Badge>
        {article.tags &&
          article.tags.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
      </div>

      <h1 className="text-3xl font-bold leading-tight">{article.title}</h1>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {article.news_sources?.logo_url ? (
            <Image
              src={article.news_sources.logo_url || "/placeholder.svg?height=32&width=32"}
              alt={article.news_sources.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {article.news_sources?.name?.charAt(0) || "N"}
            </div>
          )}
          <div>
            <p className="text-sm font-medium">
              {article.news_sources?.url ? (
                <Link href={article.news_sources.url} target="_blank" className="hover:underline">
                  {article.news_sources.name || "Unknown Source"}
                </Link>
              ) : (
                article.news_sources?.name || "Unknown Source"
              )}
            </p>
            {article.published_at && (
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        {article.url && (
          <Link href={article.url} target="_blank" className="text-sm text-primary hover:underline">
            View Original Article
          </Link>
        )}
      </div>
    </div>
  )
}
