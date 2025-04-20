"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Eye, Search, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { deleteArticle } from "@/app/actions/admin/articles"
import { useRouter } from "next/navigation"

type Article = {
  id: string
  title: string
  published_at: string | null
  category: string | null
  impact_score: number
  source_id: string
  news_sources?: {
    name: string | null
  }
}

interface ArticlesListProps {
  initialArticles: Article[]
}

export function ArticlesList({ initialArticles }: ArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSearch = async () => {
    try {
      setLoading(true)

      let query = supabase
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

      // Apply search if provided
      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`)
      }

      // Apply category filter if selected
      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category", categoryFilter)
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error("Error searching articles:", error)
      toast({
        title: "Error",
        description: "Failed to search articles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories from articles
  const categories = Array.from(new Set(initialArticles.map((article) => article.category).filter(Boolean)))

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return

    try {
      const result = await deleteArticle(id)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete article")
      }

      setArticles(articles.filter((article) => article.id !== id))
      toast({
        title: "Article deleted",
        description: "The article has been removed from the database",
      })

      router.refresh()
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

  useEffect(() => {
    handleSearch()
  }, [categoryFilter])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Articles</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button variant="outline" onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category || ""}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild>
              <Link href="/admin/articles/new">
                <Plus className="h-4 w-4 mr-2" />
                New
              </Link>
            </Button>
          </div>
        </div>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted-foreground">
                    Loading articles...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
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
