"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { defaultImpactFactors } from "@/lib/types/impact-score"

export async function saveImpactPreferences(factorWeights: Record<string, number>) {
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "You must be logged in to save preferences" }
    }

    // Check if preferences already exist
    const { data: existingPrefs } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", user.id)
      .single()

    // Update preferences with new impact factor weights
    const updatedPreferences = {
      ...(existingPrefs?.preferences || {}),
      impactFactors: factorWeights,
      impactFactorsLastUpdated: new Date().toISOString(),
    }

    // Save to database
    const { error } = await supabase.from("user_preferences").upsert({
      user_id: user.id,
      preferences: updatedPreferences,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw error
    }

    // Revalidate paths that might display content with impact scores
    revalidatePath("/feed")
    revalidatePath("/article/[id]", "page")
    revalidatePath("/search")

    return { success: true, message: "Impact score preferences saved successfully" }
  } catch (error) {
    console.error("Error saving impact preferences:", error)
    return { success: false, message: "Failed to save preferences" }
  }
}

export async function resetImpactPreferences() {
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "You must be logged in to reset preferences" }
    }

    // Create default weights object
    const defaultWeights = defaultImpactFactors.reduce(
      (acc, factor) => {
        acc[factor.id] = factor.defaultWeight
        return acc
      },
      {} as Record<string, number>,
    )

    // Get existing preferences
    const { data: existingPrefs } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", user.id)
      .single()

    // Update preferences with default impact factor weights
    const updatedPreferences = {
      ...(existingPrefs?.preferences || {}),
      impactFactors: defaultWeights,
      impactFactorsLastUpdated: new Date().toISOString(),
    }

    // Save to database
    const { error } = await supabase.from("user_preferences").upsert({
      user_id: user.id,
      preferences: updatedPreferences,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw error
    }

    // Revalidate paths
    revalidatePath("/feed")
    revalidatePath("/article/[id]", "page")
    revalidatePath("/search")

    return { success: true, message: "Impact score preferences reset to defaults" }
  } catch (error) {
    console.error("Error resetting impact preferences:", error)
    return { success: false, message: "Failed to reset preferences" }
  }
}

export async function getUserImpactPreferences() {
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        message: "Not logged in",
        preferences: null,
      }
    }

    // Get user preferences
    const { data: userPrefs } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", user.id)
      .single()

    // Get impact factor weights or use defaults
    const impactFactors =
      userPrefs?.preferences?.impactFactors ||
      defaultImpactFactors.reduce(
        (acc, factor) => {
          acc[factor.id] = factor.defaultWeight
          return acc
        },
        {} as Record<string, number>,
      )

    return {
      success: true,
      message: "Preferences retrieved",
      preferences: impactFactors,
    }
  } catch (error) {
    console.error("Error getting impact preferences:", error)
    return {
      success: false,
      message: "Failed to get preferences",
      preferences: null,
    }
  }
}
