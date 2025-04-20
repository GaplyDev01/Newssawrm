import { searchArticlesByVector } from "@/lib/vector-search"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { query, limit = 5 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const results = await searchArticlesByVector(query, limit)

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error in search:", error)
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}
