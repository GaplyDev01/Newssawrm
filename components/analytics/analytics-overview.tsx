import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Bookmark, Share2, ThumbsUp } from "lucide-react"

interface AnalyticsOverviewProps {
  articleViews: any[]
  savedArticles: any[]
  userEngagement: any[]
}

export function AnalyticsOverview({ articleViews, savedArticles, userEngagement }: AnalyticsOverviewProps) {
  // Calculate total views
  const totalViews = articleViews.reduce((sum, item) => sum + Number.parseInt(item.count), 0)

  // Calculate total saves
  const totalSaves = savedArticles.reduce((sum, item) => sum + Number.parseInt(item.count), 0)

  // Get shares count
  const sharesData = userEngagement.find((item) => item.event_type === "share")
  const totalShares = sharesData ? Number.parseInt(sharesData.count) : 0

  // Get likes count
  const likesData = userEngagement.find((item) => item.event_type === "like")
  const totalLikes = likesData ? Number.parseInt(likesData.count) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Article views across all users</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saved Articles</CardTitle>
          <Bookmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSaves.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Articles saved by users</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Shares</CardTitle>
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalShares.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Articles shared by users</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Likes</CardTitle>
          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Articles liked by users</p>
        </CardContent>
      </Card>
    </div>
  )
}
