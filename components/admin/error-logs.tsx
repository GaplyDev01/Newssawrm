"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface ErrorLogsProps {
  errors: any[]
}

export function ErrorLogs({ errors }: ErrorLogsProps) {
  const [expandedErrors, setExpandedErrors] = useState<string[]>([])

  const toggleErrorExpansion = (errorId: string) => {
    setExpandedErrors((prev) => (prev.includes(errorId) ? prev.filter((id) => id !== errorId) : [...prev, errorId]))
  }

  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return <Badge variant="destructive">{level}</Badge>
      case "warning":
        return <Badge variant="default">{level}</Badge>
      case "info":
        return <Badge variant="secondary">{level}</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Logs</CardTitle>
        <CardDescription>Recent system errors and warnings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {errors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No errors found</p>
          ) : (
            errors.map((error) => (
              <div key={error.id} className="rounded-md border p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getLevelBadge(error.level)}
                      <span className="font-medium">{error.message}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{error.source}</span>
                      <span className="mx-1">•</span>
                      <span>
                        {formatDistanceToNow(new Date(error.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleErrorExpansion(error.id)}>
                    {expandedErrors.includes(error.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {expandedErrors.includes(error.id) && (
                  <div className="mt-4 space-y-2">
                    {error.context && (
                      <div>
                        <p className="text-sm font-medium">Context:</p>
                        <pre className="mt-1 max-h-40 overflow-auto rounded-md bg-muted p-2 text-xs">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </div>
                    )}
                    {error.stack_trace && (
                      <div>
                        <p className="text-sm font-medium">Stack Trace:</p>
                        <pre className="mt-1 max-h-40 overflow-auto rounded-md bg-muted p-2 text-xs">
                          {error.stack_trace}
                        </pre>
                      </div>
                    )}
                    {error.user_id && (
                      <div>
                        <p className="text-sm font-medium">User ID:</p>
                        <p className="text-sm">{error.user_id}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
