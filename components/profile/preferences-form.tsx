"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  marketVolatility: z.number().min(0).max(100),
  tradingVolume: z.number().min(0).max(100),
  regulatoryImplications: z.number().min(0).max(100),
  technologyAdvancement: z.number().min(0).max(100),
  networkSecurity: z.number().min(0).max(100),
  adoptionMetrics: z.number().min(0).max(100),
  portfolioRelevance: z.number().min(0).max(100),
  industryFocus: z.number().min(0).max(100),
  geographicRelevance: z.number().min(0).max(100),
})

interface PreferencesFormProps {
  user: any
  preferences: any
}

export function PreferencesForm({ user, preferences }: PreferencesFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: (preferences?.theme as any) || "system",
      marketVolatility: preferences?.preferences?.impactFactors?.market_volatility || 50,
      tradingVolume: preferences?.preferences?.impactFactors?.trading_volume || 50,
      regulatoryImplications: preferences?.preferences?.impactFactors?.regulatory_implications || 50,
      technologyAdvancement: preferences?.preferences?.impactFactors?.technology_advancement || 50,
      networkSecurity: preferences?.preferences?.impactFactors?.network_security || 50,
      adoptionMetrics: preferences?.preferences?.impactFactors?.adoption_metrics || 50,
      portfolioRelevance: preferences?.preferences?.impactFactors?.portfolio_relevance || 50,
      industryFocus: preferences?.preferences?.impactFactors?.industry_focus || 50,
      geographicRelevance: preferences?.preferences?.impactFactors?.geographic_relevance || 50,
    },
  })

  const onSubmit = async (values: z.infer<typeof preferencesSchema>) => {
    setIsLoading(true)

    try {
      // Update the preferences
      const { error } = await supabase
        .from("user_preferences")
        .update({
          theme: values.theme,
          preferences: {
            impactFactors: {
              market_volatility: values.marketVolatility,
              trading_volume: values.tradingVolume,
              regulatory_implications: values.regulatoryImplications,
              technology_advancement: values.technologyAdvancement,
              network_security: values.networkSecurity,
              adoption_metrics: values.adoptionMetrics,
              portfolio_relevance: values.portfolioRelevance,
              industry_focus: values.industryFocus,
              geographic_relevance: values.geographicRelevance,
            },
            impactFactorsLastUpdated: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error: any) {
      console.error("Preferences update error:", error)
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your preferences.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your experience and impact factor weights</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose your preferred theme for the application.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Impact Factor Weights</h3>
              <p className="text-sm text-muted-foreground">
                Adjust how much each factor contributes to the overall impact score of articles.
              </p>

              <FormField
                control={form.control}
                name="marketVolatility"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Market Volatility</FormLabel>
                      <span className="text-sm">{field.value}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>How much market price fluctuations matter to you.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tradingVolume"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Trading Volume</FormLabel>
                      <span className="text-sm">{field.value}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>Importance of trading activity and liquidity.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regulatoryImplications"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Regulatory Implications</FormLabel>
                      <span className="text-sm">{field.value}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>How much regulatory news matters to your strategy.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="technologyAdvancement"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Technology Advancement</FormLabel>
                      <span className="text-sm">{field.value}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>Importance of technological developments and innovations.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="networkSecurity"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Network Security</FormLabel>
                      <span className="text-sm">{field.value}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>How much security-related news impacts your decisions.</FormDescription>
                    <FormMessage />
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
                "Save Preferences"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
