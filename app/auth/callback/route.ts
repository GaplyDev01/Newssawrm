import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user after authentication
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (!profile) {
          // Create profile with default role
          await supabase.from("profiles").insert({
            id: user.id,
            full_name: user.user_metadata.full_name || user.user_metadata.name || "",
            role: "user", // Set default role explicitly
            intelligence_profile: {
              market_focus: "General Markets",
              organization_scale: "Not specified",
              interests: [],
            },
          })
        }

        // Check if preferences exist
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single()

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

        // Check if user is admin and redirect accordingly
        if (profile && profile.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url))
        }
      }

      // If this is an email verification, redirect to the email verified page
      if (type === "email_change" || type === "signup") {
        return NextResponse.redirect(new URL("/auth/email-verified", request.url))
      }

      // For password reset, OAuth, or other auth flows, redirect to the dashboard
      return NextResponse.redirect(new URL("/feed", request.url))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/auth?error=callback_error", request.url))
}
