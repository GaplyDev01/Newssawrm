"use client"

import { useState, useEffect } from "react"
import { X, Share, Maximize2, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RelatedArticleCard } from "@/components/article/related-article-card"
import { useRouter } from "next/navigation"
import { getUserImpactPreferences } from "@/lib/actions/impact-preferences-actions"

interface ArticleModalProps {
  article: any
  onClose: () => void
  relatedArticles: any[]
}

export function ArticleModal({ article, onClose, relatedArticles }: ArticleModalProps) {
  const [activeTab, setActiveTab] = useState("related")
  const [isPersonalized, setIsPersonalized] = useState(false)
  const router = useRouter()

  // Check if user has personalized impact factors
  useEffect(() => {
    const checkPersonalization = async () => {
      const result = await getUserImpactPreferences()
      setIsPersonalized(result.success && result.preferences !== null)
    }

    checkPersonalization()
  }, [])

  const handleSettingsClick = () => {
    router.push("/settings/impact-factors")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 z-50 grid h-[calc(100%-2rem)] grid-rows-[auto_1fr] gap-4 overflow-hidden rounded-lg border bg-background shadow-lg md:inset-10 md:h-[calc(100%-5rem)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold">Impact Scores: See What Needs Your Attention</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 overflow-auto p-6 md:grid-cols-[1fr_350px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Impact score badge */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2 12H4M6 20L7 18M6 4L7 6M18 20L17 18M18 4L17 6M12 2V4M12 20V22M20 12H22M8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                High Impact (92%)
              </Badge>
              <Badge variant="outline">Category: Information Prioritization</Badge>
              {isPersonalized && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Settings className="h-3 w-3 mr-1" />
                  Personalized
                </Badge>
              )}
            </div>

            {/* Article content */}
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <p className="mb-6 text-lg leading-relaxed">
                SophIQ's Impact Scoring system revolutionizes how you prioritize information by instantly showing you
                which news and developments deserve your immediate attention. Our proprietary algorithm analyzes
                multiple factors to calculate a precise impact score for each piece of content, ranging from 0-100%. The
                impact score is determined by analyzing the intersection between the article's content and your specific
                interests, the market significance of the development, historical patterns of similar events, and
                real-time market reactions.
              </p>
              <p className="mb-6 text-lg leading-relaxed">
                This multi-dimensional analysis ensures that the score accurately reflects the potential importance of
                the news to your specific context. High-impact items (67-100%) are prominently highlighted, indicating
                they may require immediate attention or action. Medium-impact items (34-66%) suggest developments worth
                monitoring, while low-impact items (0-33%) provide context but typically don't require urgent
                consideration. This intelligent prioritization system ensures you focus your limited time and attention
                on what truly matters.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button variant="outline" size="sm" onClick={handleSettingsClick} className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Customize Impact Factors
                </Button>
              </div>
            </div>

            {/* What it means */}
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-primary">What It Means</h3>
              <p className="text-base leading-relaxed">
                With an exceptionally high impact score of 92%, our Impact Scoring feature represents a significant
                competitive advantage and addresses a critical pain point for crypto professionals. The substantial gap
                between our score and competitor offerings (45%) indicates this feature could be a primary driver for
                user acquisition and retention. Consider highlighting this feature prominently in marketing materials
                and onboarding flows.
              </p>
            </div>

            {/* Related content tabs */}
            <Tabs defaultValue="related" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="related" onClick={() => setActiveTab("related")}>
                  Related Articles
                </TabsTrigger>
                <TabsTrigger value="past" onClick={() => setActiveTab("past")}>
                  Past Articles
                </TabsTrigger>
                <TabsTrigger value="tweets" onClick={() => setActiveTab("tweets")}>
                  Latest Tweets
                </TabsTrigger>
              </TabsList>
              <TabsContent value="related" className="mt-4 space-y-4">
                {relatedArticles.map((article) => (
                  <RelatedArticleCard key={article.id} article={article} />
                ))}
              </TabsContent>
              <TabsContent value="past" className="mt-4">
                <div className="text-center py-4 text-muted-foreground">Past articles will appear here</div>
              </TabsContent>
              <TabsContent value="tweets" className="mt-4">
                <div className="text-center py-4 text-muted-foreground">Latest tweets will appear here</div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Impact Analysis */}
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-primary">Impact Analysis</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Market Impact</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Competitor Impact</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                {isPersonalized && (
                  <div className="pt-2 text-xs text-muted-foreground">
                    <p>* Impact scores are personalized based on your preferences</p>
                  </div>
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-primary">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Related Articles</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Past Articles</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Social Mentions</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category Rank</p>
                  <p className="text-2xl font-bold">#3</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <h3 className="mb-2 text-xl font-semibold text-primary">Ready to Get Started?</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Sign up now to access all features and start receiving personalized insights.
              </p>
              <Button className="w-full bg-primary text-primary-foreground">Create Your Account</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
