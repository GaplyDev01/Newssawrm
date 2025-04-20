import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const cookieStore = cookies()

  if (code) {
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

    await supabase.auth.exchangeCodeForSession(code)

    // Create profile and preferences if they don't exist
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Check if profile exists
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!profile) {
        // Create profile
        await supabase.from("profiles").insert({
          id: user.id,
          full_name: user.user_metadata.full_name || "",
          intelligence_profile: {
            market_focus: "General Markets",
            organization_scale: "Not specified",
            interests: [],
          },
        })
      }

      // Check if preferences exist
      const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

      if (!preferences) {
        // Create preferences
        await supabase.from("user_preferences").insert({
          user_id: user.id,
          theme: "dark",
          email_notifications: true,
          push_notifications: true,
          in_app_notifications: true,
          preferences: {},
        })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + "/feed")
}
