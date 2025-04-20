"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createArticle, updateArticle } from "@/lib/actions/article-actions"
import { useToast } from "@/components/ui/use-toast"

// Define the form schema
const articleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  summary: z.string().min(10, "Summary must be at least 10 characters").optional().or(z.literal("")),
  source_id: z.string().uuid("Please select a valid source"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  image_url: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  category: z.string().min(1, "Please select a category"),
  tags: z.string().optional(),
  impact_score: z.coerce.number().min(0).max(100),
  published_at: z.date(),
})

type ArticleFormValues = z.infer<typeof articleSchema>

type NewsSource = {
  id: string
  name: string
}

type ArticleFormProps = {
  article?: any
  sources: NewsSource[]
  mode: "create" | "edit"
}

export function ArticleForm({ article, sources, mode }: ArticleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set default values based on mode
  const defaultValues: Partial<ArticleFormValues> =
    mode === "edit" && article
      ? {
          ...article,
          published_at: article.published_at ? new Date(article.published_at) : new Date(),
          tags: article.tags ? article.tags.join(", ") : "",
        }
      : {
          title: "",
          content: "",
          summary: "",
          source_id: "",
          url: "",
          image_url: "",
          category: "",
          tags: "",
          impact_score: 50,
          published_at: new Date(),
        }

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues,
  })

  const onSubmit = async (data: ArticleFormValues) => {
    try {
      setIsSubmitting(true)

      // Convert tags string to array
      const formattedData = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
      }

      let result

      if (mode === "edit" && article) {
        result = await updateArticle(article.id, formattedData)
      } else {
        result = await createArticle(formattedData)
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to save article")
      }

      toast({
        title: mode === "edit" ? "Article updated" : "Article created",
        description:
          mode === "edit" ? "The article has been successfully updated" : "The article has been successfully created",
      })

      // Redirect back to articles list
      router.push("/admin/articles")
      router.refresh()
    } catch (error) {
      console.error("Error saving article:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save article",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    "Cryptocurrency",
    "Blockchain",
    "DeFi",
    "NFTs",
    "Regulation",
    "Technology",
    "Business",
    "Markets",
    "Mining",
    "Security",
    "Other",
  ]

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...form.register("title")} placeholder="Article title" />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_id">Source *</Label>
              <Select
                defaultValue={form.getValues("source_id")}
                onValueChange={(value) => form.setValue("source_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.source_id && (
                <p className="text-sm text-red-500">{form.formState.errors.source_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                defaultValue={form.getValues("category")}
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="published_at">Published Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.getValues("published_at") && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.getValues("published_at") ? (
                      format(form.getValues("published_at"), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.getValues("published_at")}
                    onSelect={(date) => date && form.setValue("published_at", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.published_at && (
                <p className="text-sm text-red-500">{form.formState.errors.published_at.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Article URL</Label>
              <Input id="url" {...form.register("url")} placeholder="https://example.com/article" />
              {form.formState.errors.url && <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" {...form.register("image_url")} placeholder="https://example.com/image.jpg" />
              {form.formState.errors.image_url && (
                <p className="text-sm text-red-500">{form.formState.errors.image_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" {...form.register("tags")} placeholder="crypto, bitcoin, ethereum" />
              {form.formState.errors.tags && (
                <p className="text-sm text-red-500">{form.formState.errors.tags.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact_score">Impact Score (0-100) *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="impact_score"
                  type="number"
                  min="0"
                  max="100"
                  {...form.register("impact_score", { valueAsNumber: true })}
                />
                <div className="w-full max-w-md">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.getValues("impact_score")}
                    onChange={(e) => form.setValue("impact_score", Number.parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              {form.formState.errors.impact_score && (
                <p className="text-sm text-red-500">{form.formState.errors.impact_score.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              {...form.register("summary")}
              placeholder="Brief summary of the article"
              className="min-h-[100px]"
            />
            {form.formState.errors.summary && (
              <p className="text-sm text-red-500">{form.formState.errors.summary.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              {...form.register("content")}
              placeholder="Full article content"
              className="min-h-[200px]"
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/articles")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Update Article" : "Create Article"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
