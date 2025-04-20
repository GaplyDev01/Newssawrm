"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/database.types"

// Create a new article
export async function createArticle(articleData: any): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return { success: false, error: "Unauthorized: Only admins can create articles" }
    }

    // Format the data for insertion
    const formattedData = {
      ...articleData,
      published_at: articleData.published_at.toISOString(),
      created_at: new Date().toISOString(),
    }

    // Insert the new article
    const { error } = await supabase.from("news_articles").insert(formattedData)

    if (error) throw error

    // Revalidate the admin articles page
    revalidatePath("/admin/articles")

    return { success: true }
  } catch (error) {
    console.error("Error creating article:", error)
    return { success: false, error: "Failed to create article" }
  }
}

// Update an existing article
export async function updateArticle(
  articleId: string,
  articleData: any,
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return { success: false, error: "Unauthorized: Only admins can update articles" }
    }

    // Format the data for update
    const formattedData = {
      ...articleData,
      published_at: articleData.published_at.toISOString(),
    }

    // Update the article
    const { error } = await supabase.from("news_articles").update(formattedData).eq("id", articleId)

    if (error) throw error

    // Revalidate the admin articles page
    revalidatePath("/admin/articles")
    revalidatePath(`/admin/articles/edit/${articleId}`)
    revalidatePath(`/article/${articleId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating article:", error)
    return { success: false, error: "Failed to update article" }
  }
}

// Delete an article
export async function deleteArticle(articleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return { success: false, error: "Unauthorized: Only admins can delete articles" }
    }

    // Delete the article
    const { error } = await supabase.from("news_articles").delete().eq("id", articleId)

    if (error) throw error

    // Revalidate the admin articles page
    revalidatePath("/admin/articles")

    return { success: true }
  } catch (error) {
    console.error("Error deleting article:", error)
    return { success: false, error: "Failed to delete article" }
  }
}

// Get article by ID
export async function getArticleById(articleId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Get the article
    const { data, error } = await supabase
      .from("news_articles")
      .select(`
        *,
        news_sources (
          name,
          logo_url
        )
      `)
      .eq("id", articleId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error getting article:", error)
    return { success: false, error: "Failed to get article" }
  }
}
