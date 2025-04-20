import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { EmbeddingsStatus } from "@/components/admin/embeddings-status"
import { EmbeddingsActions } from "@/components/admin/embeddings-actions"

export default async function EmbeddingsPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the user's profile to check if they're an admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/feed")
  }

  // Get embedding statistics
  const { count: totalArticles } = await supabase.from("news_articles").select("*", { count: "exact", head: true })

  const { count: articlesWithEmbeddings } = await supabase
    .from("news_articles")
    .select("*", { count: "exact", head: true })
    .not("embedding", "is", null)

  const { count: articlesWithoutEmbeddings } = await supabase
    .from("news_articles")
    .select("*", { count: "exact", head: true })
    .is("embedding", null)

  // Get articles without embeddings
  const { data: missingEmbeddings } = await supabase
    .from("news_articles")
    .select("id, title, published_at")
    .is("embedding", null)
    .order("published_at", { ascending: false })
    .limit(10)

  // Get articles with old embeddings (more than 30 days old)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: oldEmbeddings } = await supabase
    .from("news_articles")
    .select("id, title, published_at, last_embedded_at")
    .lt("last_embedded_at", thirtyDaysAgo.toISOString())
    .not("embedding", "is", null)
    .order("last_embedded_at", { ascending: true })
    .limit(10)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Embeddings Management</h1>
        <p className="text-muted-foreground mt-1">Manage article embeddings for vector search</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <EmbeddingsStatus
          totalArticles={totalArticles || 0}
          articlesWithEmbeddings={articlesWithEmbeddings || 0}
          articlesWithoutEmbeddings={articlesWithoutEmbeddings || 0}
        />

        <div className="mt-8">
          <EmbeddingsActions missingEmbeddings={missingEmbeddings || []} oldEmbeddings={oldEmbeddings || []} />
        </div>
      </div>
    </div>
  )
}
