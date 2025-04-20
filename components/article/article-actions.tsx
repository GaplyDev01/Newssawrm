"use client"

import { useState, useEffect } from "react"
import { Bookmark, Share2, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

interface ArticleActionsProps {
  article: any
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const { toast } = useToast()
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Get the current user and check if article is saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)

        // Check if article is saved
        const { data: savedArticle } = await supabase
          .from("saved_articles")
          .select("id")
          .eq("user_id", data.user.id)
          .eq("article_id", article.id)
          .single()

        setIsSaved(!!savedArticle)
      }
    }

    checkSavedStatus()
  }, [article.id])

  const handleSaveArticle = async () => {
    try {
      setIsSaving(true)

      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save articles",
          variant: "destructive",
        })
        return
      }

      if (isSaved) {
        // Remove from saved
        await supabase.from("saved_articles").delete().eq("user_id", userId).eq("article_id", article.id)

        // Track unsave event
        await supabase.from("user_reading_events").insert({
          user_id: userId,
          article_id: article.id,
          event_type: "unsave",
        })

        toast({
          title: "Article removed",
          description: "Article removed from saved items",
        })
      } else {
        // Save article
        await supabase.from("saved_articles").insert({
          user_id: userId,
          article_id: article.id,
        })

        // Track save event
        await supabase.from("user_reading_events").insert({
          user_id: userId,
          article_id: article.id,
          event_type: "save",
        })

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

  const handleShareArticle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary || "Check out this article",
          url: window.location.href,
        })

        // Track share event
        if (userId) {
          await supabase.from("user_reading_events").insert({
            user_id: userId,
            article_id: article.id,
            event_type: "share",
          })
        }
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      })
    }
  }

  const handleLikeArticle = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like articles",
        variant: "destructive",
      })
      return
    }

    // Track like event
    if (!isLiked) {
      await supabase.from("user_reading_events").insert({
        user_id: userId,
        article_id: article.id,
        event_type: "like",
      })
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
    </div>
  )
}
