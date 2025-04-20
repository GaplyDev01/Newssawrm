"use client"

import { useEffect, useState, useRef } from "react"
import { trackReadingEvent } from "@/lib/services/reading-tracker"
import { supabase } from "@/lib/supabase-client"

interface UseReadingTrackerProps {
  articleId: string
  enabled?: boolean
}

export function useReadingTracker({ articleId, enabled = true }: UseReadingTrackerProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const [isVisible, setIsVisible] = useState(true)
  const [readPercentage, setReadPercentage] = useState(0)

  // Get the current user
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
      }
    }

    if (enabled) {
      getUserId()
    }
  }, [enabled])

  // Track when the article comes into view
  useEffect(() => {
    if (!enabled || !userId || !articleId) return

    // Track initial view
    trackReadingEvent({
      userId,
      articleId,
      eventType: "view",
    })

    // Reset the timer when the component mounts
    startTimeRef.current = Date.now()

    // Use Intersection Observer to detect if article is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      { threshold: 0.1 }, // 10% of the element needs to be visible
    )

    // Find the article element
    const articleElement = document.querySelector('[data-article-id="' + articleId + '"]')
    if (articleElement) {
      observer.observe(articleElement)
    }

    return () => {
      observer.disconnect()

      // Track reading time when component unmounts
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      if (duration > 5) {
        // Only track if they spent at least 5 seconds
        trackReadingEvent({
          userId,
          articleId,
          eventType: "read",
          duration,
          completionPercentage: readPercentage,
        })
      }
    }
  }, [enabled, userId, articleId, readPercentage])

  // Track scroll position to estimate read percentage
  useEffect(() => {
    if (!enabled || !userId || !articleId || !isVisible) return

    const handleScroll = () => {
      const articleElement = document.querySelector('[data-article-id="' + articleId + '"]')
      if (!articleElement) return

      const { top, bottom, height } = articleElement.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate how much of the article is visible
      const visibleTop = Math.max(0, top)
      const visibleBottom = Math.min(windowHeight, bottom)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)

      // Calculate percentage read based on scroll position
      const percentage = Math.min(100, Math.round((visibleHeight / height) * 100))
      setReadPercentage(Math.max(readPercentage, percentage))
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [enabled, userId, articleId, isVisible, readPercentage])

  // Functions to track specific events
  const trackSave = () => {
    if (enabled && userId && articleId) {
      trackReadingEvent({
        userId,
        articleId,
        eventType: "save",
      })
    }
  }

  const trackShare = () => {
    if (enabled && userId && articleId) {
      trackReadingEvent({
        userId,
        articleId,
        eventType: "share",
      })
    }
  }

  const trackLike = () => {
    if (enabled && userId && articleId) {
      trackReadingEvent({
        userId,
        articleId,
        eventType: "like",
      })
    }
  }

  return {
    trackSave,
    trackShare,
    trackLike,
    readPercentage,
  }
}
