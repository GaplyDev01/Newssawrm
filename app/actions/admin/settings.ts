"use server"
import { makeClient } from "@/lib/serverClient"
import { revalidatePath } from "next/cache"

// Get admin setting
export async function getAdminSetting(key: string): Promise<{ success: boolean; value?: any; error?: string }> {
  try {
    const supabase = await makeClient()

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return { success: false, error: "Unauthorized: Only admins can access settings" }
    }

    // Get the setting
    const { data, error } = await supabase.from("admin_settings").select("value").eq("key", key).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No setting found
        return { success: true, value: null }
      }
      throw error
    }

    return { success: true, value: data.value }
  } catch (error) {
    console.error(`Error getting admin setting ${key}:`, error)
    return { success: false, error: "Failed to get admin setting" }
  }
}

// Set admin setting
export async function setAdminSetting(key: string, value: any): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await makeClient()

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return { success: false, error: "Unauthorized: Only admins can update settings" }
    }

    // Upsert the setting
    const { error } = await supabase
      .from("admin_settings")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      })
      .eq("key", key)

    if (error) throw error

    // Revalidate admin settings page
    revalidatePath("/admin/settings")

    return { success: true }
  } catch (error) {
    console.error(`Error setting admin setting ${key}:`, error)
    return { success: false, error: "Failed to set admin setting" }
  }
}

// Delete admin setting
export async function deleteAdminSetting(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await makeClient()

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return { success: false, error: "Unauthorized: Only admins can delete settings" }
    }

    // Delete the setting
    const { error } = await supabase.from("admin_settings").delete().eq("key", key)

    if (error) throw error

    // Revalidate admin settings page
    revalidatePath("/admin/settings")

    return { success: true }
  } catch (error) {
    console.error(`Error deleting admin setting ${key}:`, error)
    return { success: false, error: "Failed to delete admin setting" }
  }
}
