"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Verify reCAPTCHA token server-side
export async function verifyRecaptcha(token: string): Promise<{ success: boolean; error?: string }> {
  // Skip verification in development
  if (process.env.NODE_ENV !== "production") {
    return { success: true }
  }

  try {
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY

    if (!recaptchaSecret) {
      console.error("RECAPTCHA_SECRET_KEY is not defined")
      return { success: false, error: "reCAPTCHA configuration error" }
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${recaptchaSecret}&response=${token}`,
    })

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        error: "reCAPTCHA verification failed",
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error)
    return { success: false, error: "Failed to verify reCAPTCHA" }
  }
}

// Sign up with Supabase
export async function signUpUser(
  email: string,
  password: string,
  fullName: string,
  captchaToken?: string | null,
): Promise<{ success: boolean; error?: string }> {
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

    // Prepare signup options
    const signUpOpts =
      process.env.NODE_ENV === "production" && captchaToken
        ? {
            email,
            password,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
              data: {
                full_name: fullName,
              },
              captchaToken,
            },
          }
        : {
            email,
            password,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
              data: {
                full_name: fullName,
              },
            },
          }

    const { error } = await supabase.auth.signUp(signUpOpts)

    if (error) {
      if (error.status === 429) {
        return { success: false, error: "Too many signup attempts. Please try again later." }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error signing up:", error)
    return { success: false, error: error.message || "An error occurred during sign up" }
  }
}
