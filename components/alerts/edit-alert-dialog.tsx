"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

const alertSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  alertType: z.enum(["price_movement", "news_mention", "volume_spike", "regulatory_update"]),
  asset: z.string().min(1, { message: "Asset is required" }).optional(),
  keyword: z.string().min(1, { message: "Keyword is required" }).optional(),
  threshold: z.coerce.number().min(0).optional(),
  timeframe: z.enum(["1h", "24h", "7d", "30d"]).optional(),
})

interface EditAlertDialogProps {
  alert: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAlertDialog({ alert, open, onOpenChange }: EditAlertDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof alertSchema>>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      name: "",
      description: "",
      alertType: "price_movement",
      asset: "",
      keyword: "",
      threshold: 5,
      timeframe: "24h",
    },
  })

  // Update form values when alert changes
  useEffect(() => {
    if (alert) {
      form.reset({
        name: alert.name,
        description: alert.description || "",
        alertType: alert.alert_type,
        asset: alert.criteria?.asset || "",
        keyword: alert.criteria?.keywords?.[0] || "",
        threshold: alert.criteria?.threshold_percentage || 5,
        timeframe: alert.criteria?.timeframe || "24h",
      })
    }
  }, [alert, form])

  const alertType = form.watch("alertType")

  const onSubmit = async (values: z.infer<typeof alertSchema>) => {
    if (!alert) return

    setIsLoading(true)

    try {
      // Prepare criteria based on alert type
      let criteria = {}
      switch (values.alertType) {
        case "price_movement":
          criteria = {
            asset: values.asset,
            threshold_percentage: values.threshold,
            timeframe: values.timeframe,
          }
          break
        case "news_mention":
          criteria = {
            keywords: [values.keyword],
            sources: [],
          }
          break
        case "volume_spike":
          criteria = {
            asset: values.asset,
            threshold_percentage: values.threshold,
            timeframe: values.timeframe,
          }
          break
        case "regulatory_update":
          criteria = {
            keywords: [values.keyword],
            regions: [],
          }
          break
      }

      // Update the alert
      const { error } = await supabase
        .from("alerts")
        .update({
          name: values.name,
          description: values.description || null,
          alert_type: values.alertType,
          criteria,
          updated_at: new Date().toISOString(),
        })
        .eq("id", alert.id)

      if (error) throw error

      toast({
        title: "Alert updated",
        description: "Your alert has been updated successfully.",
      })

      // Close dialog
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error updating alert:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the alert.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Alert</DialogTitle>
          <DialogDescription>Update your alert settings.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bitcoin Price Alert" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alert me when Bitcoin price changes significantly" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alertType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an alert type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="price_movement">Price Movement</SelectItem>
                      <SelectItem value="news_mention">News Mention</SelectItem>
                      <SelectItem value="volume_spike">Volume Spike</SelectItem>
                      <SelectItem value="regulatory_update">Regulatory Update</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose the type of event you want to be alerted about.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(alertType === "price_movement" || alertType === "volume_spike") && (
              <>
                <FormField
                  control={form.control}
                  name="asset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset</FormLabel>
                      <FormControl>
                        <Input placeholder="BTC" {...field} />
                      </FormControl>
                      <FormDescription>Enter the ticker symbol of the asset (e.g., BTC, ETH).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Threshold (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>Minimum percentage change to trigger the alert.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeframe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a timeframe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1h">1 Hour</SelectItem>
                          <SelectItem value="24h">24 Hours</SelectItem>
                          <SelectItem value="7d">7 Days</SelectItem>
                          <SelectItem value="30d">30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The time period over which to measure the change.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {(alertType === "news_mention" || alertType === "regulatory_update") && (
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keyword</FormLabel>
                    <FormControl>
                      <Input placeholder="Bitcoin" {...field} />
                    </FormControl>
                    <FormDescription>Enter a keyword to monitor in news articles.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Alert"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
