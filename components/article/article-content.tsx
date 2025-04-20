"use client"

import Image from "next/image"
import { useReadingTracker } from "@/hooks/use-reading-tracker"

interface ArticleContentProps {
  article: any
}

export function ArticleContent({ article }: ArticleContentProps) {
  // Initialize reading tracker
  useReadingTracker({ articleId: article.id })

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
            src={article.image_url || "/placeholder.svg"}
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
