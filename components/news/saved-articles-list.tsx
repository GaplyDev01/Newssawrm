"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Share2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"

interface SavedArticle {
  id: string
  created_at: string
  news_articles: {
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
    news_sources: {
      name: string
      logo_url: string | null
    } | null
  }
}

interface SavedArticlesListProps {
  savedArticles: SavedArticle[]
}

export function SavedArticlesList({ savedArticles }: SavedArticlesListProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [articles, setArticles] = useState(savedArticles)

  const handleRemoveArticle = async (savedId: string) => {
    try {
      await supabase.from("saved_articles").delete().eq("id", savedId)

      setArticles(articles.filter((article) => article.id !== savedId))

      toast({
        title: "Article removed",
        description: "Article removed from saved items",
      })
    } catch (error) {
      console.error("Error removing article:", error)
      toast({
        title: "Error",
        description: "Failed to remove article",
        variant: "destructive",
      })
    }
  }

  const getImpactLabel = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 50) return "Moderate"
    return "Low"
  }

  return (
    <div className="space-y-4">
      {articles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No saved articles</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/feed")}>
            Browse News Feed
          </Button>
        </div>
      ) : (
        articles.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{article.news_articles.news_sources?.name || "Unknown Source"}</span>
                  <span>•</span>
                  <span>
                    {article.news_articles.published_at
                      ? formatDistanceToNow(new Date(article.news_articles.published_at), { addSuffix: true })
                      : "Unknown date"}
                  </span>
                </div>
                <Badge
                  variant={
                    getImpactLabel(article.news_articles.impact_score) === "High"
                      ? "destructive"
                      : getImpactLabel(article.news_articles.impact_score) === "Moderate"
                        ? "default"
                        : "secondary"
                  }
                >
                  {getImpactLabel(article.news_articles.impact_score)} Impact
                </Badge>
              </div>
              <Link href={`/article/${article.news_articles.id}`} className="hover:underline">
                <CardTitle className="text-xl mt-1">{article.news_articles.title}</CardTitle>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {article.news_articles.summary || article.news_articles.content.substring(0, 150) + "..."}
              </p>
              <div className="flex items-center gap-2">
                {article.news_articles.category && <Badge variant="outline">{article.news_articles.category}</Badge>}
                {article.news_articles.tags &&
                  article.news_articles.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveArticle(article.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/article/${article.news_articles.id}`}>View Full Article</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Find Similar Articles</DropdownMenuItem>
                      <DropdownMenuItem>Report</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
