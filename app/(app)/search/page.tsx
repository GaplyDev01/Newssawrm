import { createClient } from "@/lib/supabase-server"
import { SearchForm } from "@/components/search/search-form"
import { SearchResults } from "@/components/search/search-results"
import { generateEmbedding } from "@/lib/openai"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string }
}) {
  const supabase = createClient()
  const query = searchParams.query || ""

  // If there's a query, search for articles
  let results = []
  if (query) {
    try {
      // Generate embedding for the search query
      const embedding = await generateEmbedding(query)

      // Use vector search if embedding was generated successfully
      if (embedding) {
        const { data } = await supabase.rpc("match_news_articles", {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 10,
        })

        results = data || []
      } else {
        // Fallback to text search if embedding generation fails
        const { data } = await supabase
          .from("news_articles")
          .select(`
            id,
            title,
            content,
            summary,
            published_at,
            url,
            image_url,
            category,
            tags,
            impact_score,
            news_sources (
              name
            )
          `)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order("published_at", { ascending: false })
          .limit(10)

        results = data || []
      }
    } catch (error) {
      console.error("Search error:", error)

      // Log the error
      await supabase.from("error_logs").insert({
        level: "error",
        message: "Search failed",
        source: "search/page.tsx",
        context: { query, error: (error as Error).message },
        timestamp: new Date().toISOString(),
      })

      // Fallback to text search
      const { data } = await supabase
        .from("news_articles")
        .select(`
          id,
          title,
          content,
          summary,
          published_at,
          url,
          image_url,
          category,
          tags,
          impact_score,
          news_sources (
            name
          )
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order("published_at", { ascending: false })
        .limit(10)

      results = data || []
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">Search for articles, topics, or concepts</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          <SearchForm initialQuery={query} />

          {query && (
            <div className="mt-6">
              <h2 className="text-lg font-medium mb-4">
                {results.length === 0 ? "No results found" : `Found ${results.length} results for "${query}"`}
              </h2>
              <SearchResults results={results} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
