"use server"
import { makeClient } from "@/lib/serverClient"
import { revalidatePath } from "next/cache"
import { defaultImpactFactors } from "@/lib/types/impact-score"
import { logErrorEvent, logInfoEvent, logWarningEvent } from "@/lib/error-logger"

export async function saveImpactPreferences(factorWeights: Record<string, number>) {
  try {
    const supabase = makeClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      await logWarningEvent("Unauthorized attempt to save impact preferences", "saveImpactPreferences")
      return { success: false, message: "You must be logged in" }
    }

    const { data: existing } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", user.id)
      .single()

    const updatedPreferences = {
      ...(existing?.preferences || {}),
      impactFactors: factorWeights,
      impactFactorsLastUpdated: new Date().toISOString(),
    }

    const { error } = await supabase.from("user_preferences").upsert({
      user_id: user.id,
      preferences: updatedPreferences,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      await logErrorEvent("Failed to save impact preferences", "saveImpactPreferences", error, {
        userId: user.id,
      })
      throw error
    }

    revalidatePath("/feed")
    revalidatePath("/search")

    await logInfoEvent("Impact preferences saved", "saveImpactPreferences", {
      userId: user.id,
      factorCount: Object.keys(factorWeights).length,
    })

    return { success: true, message: "Saved!" }
  } catch (error) {
    await logErrorEvent("Error saving impact preferences", "saveImpactPreferences", error)
    return { success: false, message: "Failed to save preferences" }
  }
}

export async function resetImpactPreferences() {
  try {
    const supabase = makeClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      await logWarningEvent("Unauthorized attempt to reset impact preferences", "resetImpactPreferences")
      return { success: false, message: "You must be logged in" }
    }

    const { data: existing } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", user.id)
      .single()

    const updatedPreferences = {
      ...(existing?.preferences || {}),
      impactFactors: defaultImpactFactors,
      impactFactorsLastUpdated: new Date().toISOString(),
    }

    const { error } = await supabase.from("user_preferences").upsert({
      user_id: user.id,
      preferences: updatedPreferences,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      await logErrorEvent("Failed to reset impact preferences", "resetImpactPreferences", error, {
        userId: user.id,
      })
      throw error
    }

    revalidatePath("/feed")
    revalidatePath("/search")
    revalidatePath("/settings/impact-factors")

    await logInfoEvent("Impact preferences reset to defaults", "resetImpactPreferences", {
      userId: user.id,
    })

    return { success: true, message: "Reset to defaults!" }
  } catch (error) {
    await logErrorEvent("Error resetting impact preferences", "resetImpactPreferences", error)
    return { success: false, message: "Failed to reset preferences" }
  }
}

export async function getUserImpactPreferences() {
  try {
    const supabase = makeClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      await logWarningEvent("Unauthorized attempt to get impact preferences", "getUserImpactPreferences")
      return { success: false, preferences: null }
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      // Not found error
      await logErrorEvent("Failed to get impact preferences", "getUserImpactPreferences", error, {
        userId: user.id,
      })
    }

    const preferences = data?.preferences?.impactFactors || null
    return { success: true, preferences }
  } catch (error) {
    await logErrorEvent("Error getting impact preferences", "getUserImpactPreferences", error)
    return { success: false, preferences: null }
  }
}
