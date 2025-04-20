"use client"

import { useState } from "react"
import { Bookmark, Share2, ThumbsUp, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { useReadingTracker } from "@/hooks/use-reading-tracker"

interface ArticleActionsProps {
  article: any
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const { toast } = useToast()
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize reading tracker
  const { trackSave, trackShare, trackLike } = useReadingTracker({
    articleId: article.id,
  })

  const handleSaveArticle = async () => {
    try {
      setIsSaving(true)
      const { data: user } = await supabase.auth.getUser()

      if (!user.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save articles",
          variant: "destructive",
        })
        return
      }

      if (isSaved) {
        // Remove from saved
        await supabase.from("saved_articles").delete().eq("user_id", user.user.id).eq("article_id", article.id)

        toast({
          title: "Article removed",
          description: "Article removed from saved items",
        })
      } else {
        // Save article
        await supabase.from("saved_articles").insert({
          user_id: user.user.id,
          article_id: article.id,
        })

        // Track save event
        trackSave()

        toast({
          title: "Article saved",
          description: "Article saved to your collection",
        })
      }

      setIsSaved(!isSaved)
    } catch (error) {
      console.error("Error saving article:", error)
      toast({
        title: "Error",
        description: "Failed to save article",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareArticle = () => {
    // Track share event
    trackShare()

    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.summary || "Check out this article",
          url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error))
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      })
    }
  }

  const handleLikeArticle = () => {
    // Track like event
    if (!isLiked) {
      trackLike()
    }

    setIsLiked(!isLiked)
    toast({
      title: isLiked ? "Removed like" : "Article liked",
      description: isLiked ? "You've removed your like" : "Thanks for your feedback!",
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        className={isSaved ? "bg-primary/10 text-primary" : ""}
        onClick={handleSaveArticle}
        disabled={isSaving}
      >
        <Bookmark className="mr-2 h-4 w-4" />
        {isSaved ? "Saved" : "Save"}
      </Button>

      <Button variant="outline" size="sm" onClick={handleShareArticle}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>

      <Button
        variant="outline"
        size="sm"
        className={isLiked ? "bg-primary/10 text-primary" : ""}
        onClick={handleLikeArticle}
      >
        <ThumbsUp className="mr-2 h-4 w-4" />
        {isLiked ? "Liked" : "Like"}
      </Button>

      <Button variant="outline" size="sm" asChild>
        <a href="#comments">
          <MessageSquare className="mr-2 h-4 w-4" />
          Comment
        </a>
      </Button>
    </div>
  )
}
