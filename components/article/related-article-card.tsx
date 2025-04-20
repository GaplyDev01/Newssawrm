import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface RelatedArticleCardProps {
  article: any
}

export function RelatedArticleCard({ article }: RelatedArticleCardProps) {
  return (
    <div className="group rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
        </div>
        <Badge
          variant={article.impact_score >= 80 ? "destructive" : article.impact_score >= 50 ? "default" : "secondary"}
        >
          {article.impact_score}%
        </Badge>
      </div>
      <Link href={`/article/${article.id}`} className="block">
        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{article.title}</h3>
      </Link>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
      <div className="mt-2 text-sm">
        <Link href={`/article/${article.id}`} className="text-primary hover:underline">
          Read more
        </Link>
      </div>
    </div>
  )
}
