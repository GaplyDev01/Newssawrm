"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export function RecentArticles() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("news_articles")
          .select(`
            id, 
            title, 
            published_at, 
            category, 
            impact_score,
            source_id,
            news_sources (
              name
            )
          `)
          .order("published_at", { ascending: false })
          .limit(10)

        if (error) throw error
        setArticles(data || [])
      } catch (error) {
        console.error("Error fetching articles:", error)
        toast({
          title: "Error",
          description: "Failed to load recent articles",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [toast])

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return

    try {
      const { error } = await supabase.from("news_articles").delete().eq("id", id)

      if (error) throw error

      setArticles(articles.filter((article) => article.id !== id))
      toast({
        title: "Article deleted",
        description: "The article has been removed from the database",
      })
    } catch (error) {
      console.error("Error deleting article:", error)
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      })
    }
  }

  const getImpactLabel = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 50) return "Moderate"
    return "Low"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">Loading recent articles...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Articles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Title</th>
                <th className="text-left py-3 px-4 font-medium">Source</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-left py-3 px-4 font-medium">Impact</th>
                <th className="text-left py-3 px-4 font-medium">Published</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted-foreground">
                    No articles found
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="border-b">
                    <td className="py-3 px-4 max-w-md truncate">{article.title}</td>
                    <td className="py-3 px-4">{article.news_sources?.name || "Unknown"}</td>
                    <td className="py-3 px-4">
                      {article.category && <Badge variant="outline">{article.category}</Badge>}
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                    <td className="py-3 px-4">
                      {article.published_at
                        ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                        : "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/article/${article.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/articles/edit/${article.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteArticle(article.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
