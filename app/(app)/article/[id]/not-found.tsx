import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ArticleNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The article you're looking for doesn't exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/feed">Return to News Feed</Link>
      </Button>
    </div>
  )
}
