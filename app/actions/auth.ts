"use server"
import { makeClient } from "@/lib/serverClient"
import { logErrorEvent, logInfoEvent, logWarningEvent } from "@/lib/error-logger"

// Verify reCAPTCHA
export async function verifyRecaptcha(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (process.env.NODE_ENV !== "production") return { success: true }

    const secret = process.env.RECAPTCHA_SECRET_KEY!
    if (!secret) {
      const error = new Error("Missing RECAPTCHA_SECRET_KEY")
      await logErrorEvent("Missing reCAPTCHA secret key", "verifyRecaptcha")
      return { success: false, error: "reCAPTCHA misconfiguration" }
    }

    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    })

    const data = await res.json()
    if (!data.success) {
      await logWarningEvent("reCAPTCHA verification failed", "verifyRecaptcha", null, { token: "[REDACTED]" })
      return { success: false, error: "reCAPTCHA failed" }
    }

    return { success: true }
  } catch (error) {
    await logErrorEvent("reCAPTCHA verification error", "verifyRecaptcha", error)
    return { success: false, error: "reCAPTCHA verification failed" }
  }
}

// Sign up user
export async function signUpUser(
  email: string,
  password: string,
  fullName: string,
  captchaToken?: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = makeClient()

    // build options
    const baseOpts = {
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        data: { full_name: fullName },
        ...(process.env.NODE_ENV === "production" && captchaToken ? { captchaToken } : {}),
      },
    }

    const { error } = await supabase.auth.signUp(baseOpts)
    if (error) {
      if (error.status === 429) {
        await logWarningEvent("Too many signup attempts", "signUpUser", error, { email })
        return { success: false, error: "Too many attempts, try later." }
      }
      await logErrorEvent("Signup failed", "signUpUser", error, { email })
      return { success: false, error: error.message }
    }

    await logInfoEvent("User signup successful", "signUpUser", { email })
    return { success: true }
  } catch (error) {
    await logErrorEvent("Signup error", "signUpUser", error, { email })
    return { success: false, error: "An unexpected error occurred during signup" }
  }
}
