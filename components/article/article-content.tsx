"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"

interface ArticleContentProps {
  article: any
}

export function ArticleContent({ article }: ArticleContentProps) {
  const [userId, setUserId] = useState<string | null>(null)

  // Get the current user
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
      }
    }

    getUserId()
  }, [])

  // Track article view
  useEffect(() => {
    const trackView = async () => {
      if (!userId || !article.id) return

      try {
        await supabase.from("user_reading_events").insert({
          user_id: userId,
          article_id: article.id,
          event_type: "view",
        })
      } catch (error) {
        console.error("Error tracking view:", error)
      }
    }

    if (userId) {
      trackView()
    }
  }, [userId, article.id])

  // Function to format article content with proper paragraphs
  const formatContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ))
  }

  return (
    <div className="article-content" data-article-id={article.id}>
      {article.image_url && (
        <div className="mb-6 overflow-hidden rounded-lg">
          <Image
            src={article.image_url || "/placeholder.svg?height=450&width=800"}
            alt={article.title}
            width={800}
            height={450}
            className="w-full object-cover"
          />
        </div>
      )}

      {article.summary && (
        <div className="mb-6 rounded-lg bg-muted p-4 italic">
          <p className="text-lg">{article.summary}</p>
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none">{formatContent(article.content)}</div>
    </div>
  )
}
