"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  inAppNotifications: z.boolean(),
  alertEmails: z.boolean(),
  weeklyDigest: z.boolean(),
  marketUpdates: z.boolean(),
})

interface NotificationsFormProps {
  user: any
  preferences: any
}

export function NotificationsForm({ user, preferences }: NotificationsFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailNotifications: preferences?.email_notifications || false,
      pushNotifications: preferences?.push_notifications || false,
      inAppNotifications: preferences?.in_app_notifications || false,
      alertEmails: preferences?.preferences?.notifications?.alert_emails || false,
      weeklyDigest: preferences?.preferences?.notifications?.weekly_digest || false,
      marketUpdates: preferences?.preferences?.notifications?.market_updates || false,
    },
  })

  const onSubmit = async (values: z.infer<typeof notificationsSchema>) => {
    setIsLoading(true)

    try {
      // Get the current preferences
      const currentPreferences = preferences?.preferences || {}

      // Update the preferences
      const { error } = await supabase
        .from("user_preferences")
        .update({
          email_notifications: values.emailNotifications,
          push_notifications: values.pushNotifications,
          in_app_notifications: values.inAppNotifications,
          preferences: {
            ...currentPreferences,
            notifications: {
              alert_emails: values.alertEmails,
              weekly_digest: values.weeklyDigest,
              market_updates: values.marketUpdates,
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error: any) {
      console.error("Notification preferences update error:", error)
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your notification preferences.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Channels</h3>
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>Receive notifications via email.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Push Notifications</FormLabel>
                      <FormDescription>Receive push notifications on your device.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inAppNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">In-App Notifications</FormLabel>
                      <FormDescription>Receive notifications within the application.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Types</h3>
              <FormField
                control={form.control}
                name="alertEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Alert Emails</FormLabel>
                      <FormDescription>Receive emails when your alerts are triggered.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.watch("emailNotifications")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weeklyDigest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Weekly Digest</FormLabel>
                      <FormDescription>Receive a weekly summary of important news.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.watch("emailNotifications")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marketUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Market Updates</FormLabel>
                      <FormDescription>Receive notifications about significant market movements.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Notification Settings"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
