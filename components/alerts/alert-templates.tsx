"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export function AlertTemplates() {
  const { toast } = useToast()

  const handleTemplateClick = (template: string) => {
    toast({
      title: "Template Selected",
      description: `${template} template selected. This functionality is not fully implemented in the demo.`,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Alert Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="cursor-pointer rounded-md p-3 hover:bg-muted"
          onClick={() => handleTemplateClick("Price Movement")}
        >
          <h3 className="font-medium">Price Movement</h3>
          <p className="text-sm text-muted-foreground">
            Get notified when a cryptocurrency moves above or below a certain price threshold.
          </p>
        </div>

        <div
          className="cursor-pointer rounded-md p-3 hover:bg-muted"
          onClick={() => handleTemplateClick("Trading Volume")}
        >
          <h3 className="font-medium">Trading Volume</h3>
          <p className="text-sm text-muted-foreground">
            Alert when trading volume for a token exceeds a specified threshold.
          </p>
        </div>

        <div
          className="cursor-pointer rounded-md p-3 hover:bg-muted"
          onClick={() => handleTemplateClick("News Mention")}
        >
          <h3 className="font-medium">News Mention</h3>
          <p className="text-sm text-muted-foreground">
            Notification when a specific entity or keyword appears in breaking news.
          </p>
        </div>

        <div
          className="cursor-pointer rounded-md p-3 hover:bg-muted"
          onClick={() => handleTemplateClick("Sentiment Shift")}
        >
          <h3 className="font-medium">Sentiment Shift</h3>
          <p className="text-sm text-muted-foreground">
            Alert when market sentiment for an asset changes significantly.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
