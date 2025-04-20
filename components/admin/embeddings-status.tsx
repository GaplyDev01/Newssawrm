import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface EmbeddingsStatusProps {
  totalArticles: number
  articlesWithEmbeddings: number
  articlesWithoutEmbeddings: number
}

export function EmbeddingsStatus({
  totalArticles,
  articlesWithEmbeddings,
  articlesWithoutEmbeddings,
}: EmbeddingsStatusProps) {
  const embeddingPercentage = totalArticles > 0 ? Math.round((articlesWithEmbeddings / totalArticles) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embeddings Status</CardTitle>
        <CardDescription>Overview of article embeddings for vector search</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Embedding Coverage</span>
              <span className="text-sm font-medium">{embeddingPercentage}%</span>
            </div>
            <Progress value={embeddingPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Articles</div>
              <div className="mt-1 text-2xl font-bold">{totalArticles}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">With Embeddings</div>
              <div className="mt-1 text-2xl font-bold">{articlesWithEmbeddings}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">Missing Embeddings</div>
              <div className="mt-1 text-2xl font-bold">{articlesWithoutEmbeddings}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
