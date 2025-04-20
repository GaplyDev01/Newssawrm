import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface SearchResult {
  id: string
  title: string
  content: string
  summary: string | null
  published_at: string | null
  url: string | null
  image_url: string | null
  category: string | null
  tags: string[] | null
  impact_score: number
  similarity: number
}

interface SearchResultsProps {
  results: SearchResult[]
}

export function SearchResults({ results }: SearchResultsProps) {
  const getImpactLabel = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 50) return "Moderate"
    return "Low"
  }

  const formatSimilarity = (similarity: number) => {
    return `${Math.round(similarity * 100)}%`
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={result.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {result.published_at && (
                  <span>
                    {formatDistanceToNow(new Date(result.published_at), {
                      addSuffix: true,
                    })}
                  </span>
                )}
                <span>•</span>
                <span>Match: {formatSimilarity(result.similarity)}</span>
              </div>
              <Badge
                variant={
                  getImpactLabel(result.impact_score) === "High"
                    ? "destructive"
                    : getImpactLabel(result.impact_score) === "Moderate"
                      ? "default"
                      : "secondary"
                }
              >
                {getImpactLabel(result.impact_score)} Impact
              </Badge>
            </div>
            <CardTitle className="text-xl mt-1">
              {result.url ? (
                <Link href={result.url} target="_blank" className="hover:underline">
                  {result.title}
                </Link>
              ) : (
                result.title
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{result.summary || result.content.substring(0, 200) + "..."}</p>
            <div className="flex flex-wrap items-center gap-2">
              {result.category && <Badge variant="outline">{result.category}</Badge>}
              {result.tags &&
                result.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
