"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  generateArticleEmbedding,
  generateMissingEmbeddings,
  refreshOldEmbeddings,
} from "@/app/actions/embedding-actions"

interface EmbeddingsActionsProps {
  missingEmbeddings: any[]
  oldEmbeddings: any[]
}

export function EmbeddingsActions({ missingEmbeddings, oldEmbeddings }: EmbeddingsActionsProps) {
  const { toast } = useToast()
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [isRefreshingAll, setIsRefreshingAll] = useState(false)
  const [processingArticleIds, setProcessingArticleIds] = useState<string[]>([])

  const handleGenerateEmbedding = async (articleId: string) => {
    setProcessingArticleIds((prev) => [...prev, articleId])

    try {
      const result = await generateArticleEmbedding(articleId)

      if (result.success) {
        toast({
          title: "Embedding generated",
          description: "The article embedding has been generated successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to generate embedding")
      }
    } catch (error: any) {
      console.error("Error generating embedding:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while generating the embedding.",
        variant: "destructive",
      })
    } finally {
      setProcessingArticleIds((prev) => prev.filter((id) => id !== articleId))
    }
  }

  const handleGenerateAllMissing = async () => {
    setIsGeneratingAll(true)

    try {
      const result = await generateMissingEmbeddings()

      if (result.success) {
        toast({
          title: "Embeddings generation started",
          description: result.message || "The process to generate missing embeddings has been started.",
        })
      } else {
        throw new Error(result.error || "Failed to start embeddings generation")
      }
    } catch (error: any) {
      console.error("Error generating embeddings:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while generating embeddings.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingAll(false)
    }
  }

  const handleRefreshOldEmbeddings = async () => {
    setIsRefreshingAll(true)

    try {
      const result = await refreshOldEmbeddings(30)

      if (result.success) {
        toast({
          title: "Embeddings refresh started",
          description: result.message || "The process to refresh old embeddings has been started.",
        })
      } else {
        throw new Error(result.error || "Failed to start embeddings refresh")
      }
    } catch (error: any) {
      console.error("Error refreshing embeddings:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while refreshing embeddings.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshingAll(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embeddings Management</CardTitle>
        <CardDescription>Generate and refresh article embeddings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="missing">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="missing">Missing Embeddings</TabsTrigger>
            <TabsTrigger value="old">Old Embeddings</TabsTrigger>
          </TabsList>
          <TabsContent value="missing" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleGenerateAllMissing} disabled={isGeneratingAll || missingEmbeddings.length === 0}>
                {isGeneratingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate All Missing"
                )}
              </Button>
            </div>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                <div className="col-span-6">Title</div>
                <div className="col-span-3">Published</div>
                <div className="col-span-3">Actions</div>
              </div>
              {missingEmbeddings.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No articles missing embeddings</div>
              ) : (
                missingEmbeddings.map((article) => (
                  <div key={article.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0">
                    <div className="col-span-6 truncate">{article.title}</div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      {article.published_at
                        ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                        : "Unknown"}
                    </div>
                    <div className="col-span-3">
                      <Button
                        size="sm"
                        onClick={() => handleGenerateEmbedding(article.id)}
                        disabled={processingArticleIds.includes(article.id)}
                      >
                        {processingArticleIds.includes(article.id) ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Generate"
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="old" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleRefreshOldEmbeddings} disabled={isRefreshingAll || oldEmbeddings.length === 0}>
                {isRefreshingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  "Refresh All Old"
                )}
              </Button>
            </div>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                <div className="col-span-5">Title</div>
                <div className="col-span-3">Published</div>
                <div className="col-span-3">Last Embedded</div>
                <div className="col-span-1">Actions</div>
              </div>
              {oldEmbeddings.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No articles with old embeddings</div>
              ) : (
                oldEmbeddings.map((article) => (
                  <div key={article.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0">
                    <div className="col-span-5 truncate">{article.title}</div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      {article.published_at
                        ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                        : "Unknown"}
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      {article.last_embedded_at
                        ? formatDistanceToNow(new Date(article.last_embedded_at), { addSuffix: true })
                        : "Never"}
                    </div>
                    <div className="col-span-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateEmbedding(article.id)}
                        disabled={processingArticleIds.includes(article.id)}
                      >
                        {processingArticleIds.includes(article.id) ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Refresh"
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
