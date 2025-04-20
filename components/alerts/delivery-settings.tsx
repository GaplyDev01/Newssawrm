"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface DeliverySettingsProps {
  preferences: {
    user_id: string
    email_notifications: boolean
    push_notifications: boolean
    in_app_notifications: boolean
  } | null
}

export function DeliverySettings({ preferences }: DeliverySettingsProps) {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    inApp: preferences?.in_app_notifications ?? true,
    email: preferences?.email_notifications ?? true,
    push: preferences?.push_notifications ?? true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    try {
      if (!preferences?.user_id) {
        throw new Error("User ID not found")
      }

      await supabase.from("user_preferences").upsert({
        user_id: preferences.user_id,
        in_app_notifications: settings.inApp,
        email_notifications: settings.email,
        push_notifications: settings.push,
      })

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated",
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Delivery Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">In-App Notifications</p>
            <p className="text-sm text-muted-foreground">Receive alerts within the platform</p>
          </div>
          <Switch checked={settings.inApp} onCheckedChange={() => handleToggle("inApp")} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-muted-foreground">Receive alerts via email</p>
          </div>
          <Switch checked={settings.email} onCheckedChange={() => handleToggle("email")} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
          </div>
          <Switch checked={settings.push} onCheckedChange={() => handleToggle("push")} />
        </div>

        <Button className="w-full" onClick={handleSave}>
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  )
}
