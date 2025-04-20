import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface UserActivityProps {
  activities: any[]
}

export function UserActivity({ activities }: UserActivityProps) {
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "view":
        return "Viewed"
      case "save":
        return "Saved"
      case "unsave":
        return "Unsaved"
      case "like":
        return "Liked"
      case "share":
        return "Shared"
      default:
        return type
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity</CardTitle>
        <CardDescription>Recent user interactions with articles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity found</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm">
                    <Link href={`/admin/users/${activity.user_id}`} className="font-medium hover:underline">
                      {activity.profiles?.full_name || "Unknown User"}
                    </Link>{" "}
                    {getEventTypeLabel(activity.event_type)}{" "}
                    <Link href={`/article/${activity.article_id}`} className="font-medium hover:underline">
                      {activity.news_articles?.title || "an article"}
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
