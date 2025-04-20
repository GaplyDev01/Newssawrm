"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Update user role
export async function updateUserRole(userId: string, role: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
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
      return { success: false, error: "Unauthorized: Only admins can update user roles" }
    }

    // Update the user's role
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)

    if (error) throw error

    // Revalidate the admin users page
    revalidatePath("/admin/users")

    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error: "Failed to update user role" }
  }
}

// Delete a news article
export async function deleteNewsArticle(articleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
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
