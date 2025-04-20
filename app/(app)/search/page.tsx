import { SearchForm } from "@/components/search/search-form"
import { SearchResults } from "@/components/search/search-results"
import { searchArticles } from "@/lib/actions/search-actions"
import { Card, CardContent } from "@/components/ui/card"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string }
}) {
  const query = searchParams.query || ""
  const results = query ? await searchArticles(query) : []

  // Suggested searches
  const suggestedSearches = [
    "Bitcoin price prediction",
    "Ethereum layer 2 solutions",
    "DeFi protocols comparison",
    "NFT market trends",
    "Crypto regulations",
    "Web3 development",
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Semantic Search</h1>
        <p className="text-muted-foreground mt-1">Search for articles using natural language</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          <SearchForm initialQuery={query} />

          {!query && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Suggested Searches</h2>
                <div className="flex flex-wrap gap-2">
                  {suggestedSearches.map((suggestion) => (
                    <a
                      key={suggestion}
                      href={`/search?query=${encodeURIComponent(suggestion)}`}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                    >
                      {suggestion}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
