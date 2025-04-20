"use server"
import { makeClient } from "@/lib/serverClient"
import { revalidatePath } from "next/cache"

// Update user role
export async function updateUserRole(userId: string, role: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = makeClient()

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

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

// Delete a user
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = makeClient()

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return { success: false, error: "Unauthorized: Only admins can delete users" }
    }

    // Delete the user
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw error

    // Revalidate the admin users page
    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}
