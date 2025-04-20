"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bookmark, Share2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"

interface NewsArticle {
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

interface NewsFeedProps {
  articles: NewsArticle[]
}

export function NewsFeed({ articles }: NewsFeedProps) {
  const { toast } = useToast()
  const [savedArticles, setSavedArticles] = useState<string[]>([])

  const handleSaveArticle = async (articleId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser()

      if (!user.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save articles",
          variant: "destructive",
        })
        return
      }

      // Check if already saved
      if (savedArticles.includes(articleId)) {
        // Remove from saved
        await supabase.from("saved_articles").delete().eq("user_id", user.user.id).eq("article_id", articleId)

        setSavedArticles(savedArticles.filter((id) => id !== articleId))

        toast({
          title: "Article removed",
          description: "Article removed from saved items",
        })
      } else {
        // Save article
        await supabase.from("saved_articles").insert({
          user_id: user.user.id,
          article_id: articleId,
        })

        setSavedArticles([...savedArticles, articleId])

        toast({
          title: "Article saved",
          description: "Article saved to your collection",
        })
      }
    } catch (error) {
      console.error("Error saving article:", error)
      toast({
        title: "Error",
        description: "Failed to save article",
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
          <p className="text-muted-foreground">No articles found</p>
        </div>
      ) : (
        articles.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{article.news_sources?.name || "Unknown Source"}</span>
                  <span>•</span>
                  <span>
                    {article.published_at
                      ? formatDistanceToNow(new Date(article.published_at), {
                          addSuffix: true,
                        })
                      : "Unknown date"}
                  </span>
                </div>
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
              </div>
              <Link href={`/article/${article.id}`} className="hover:underline">
                <CardTitle className="text-xl mt-1">{article.title}</CardTitle>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {article.summary || article.content.substring(0, 150) + "..."}
              </p>
              <div className="flex items-center gap-2">
                {article.category && <Badge variant="outline">{article.category}</Badge>}
                {article.tags &&
                  article.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleSaveArticle(article.id)}>
                    <Bookmark
                      className={`h-4 w-4 ${savedArticles.includes(article.id) ? "fill-primary text-primary" : ""}`}
                    />
                    <span className="sr-only">Save</span>
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
                        <Link href={`/article/${article.id}`}>View Full Article</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Hide Similar Articles</DropdownMenuItem>
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
