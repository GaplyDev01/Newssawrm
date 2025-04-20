"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"
import { signUpUser, verifyRecaptcha } from "@/lib/actions/auth-actions"
import { Loader2, Mail, Lock, User, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Import the reCAPTCHA script dynamically
const loadRecaptchaScript = () => {
  if (typeof window !== "undefined" && !window.grecaptcha && process.env.NODE_ENV === "production") {
    const script = document.createElement("script")
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit"
    script.async = true
    script.defer = true
    document.head.appendChild(script)
    return script
  }
  return null
}

// Helper function to get the correct redirect URL for the current environment
const getRedirectUrl = () => {
  // Use the environment variable if available (best for production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  }

  // Fallback to window.location.origin (works for development and preview)
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`
  }

  // Default fallback (should never reach here in client component)
  return "/auth/callback"
}

// Check if the current URL is likely a preview deployment
const isPreviewDeployment = () => {
  if (typeof window === "undefined") return false

  const hostname = window.location.hostname
  // Check for Vercel preview URL patterns
  return hostname.includes("vercel.app") && (hostname.includes("-git-") || hostname.includes("-pr-"))
}

export function AuthForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [signupCooldown, setSignupCooldown] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState<number | null>(null)
  const isProd = process.env.NODE_ENV === "production"
  const isPreview = isPreviewDeployment()

  // Load reCAPTCHA script only in production
  useEffect(() => {
    if (!isProd) return

    const script = loadRecaptchaScript()

    if (script) {
      script.onload = () => {
        setRecaptchaLoaded(true)
      }
    } else if (window.grecaptcha) {
      setRecaptchaLoaded(true)
    }

    return () => {
      if (script) {
        document.head.removeChild(script)
      }
    }
  }, [isProd])

  // Initialize reCAPTCHA widget when script is loaded
  useEffect(() => {
    if (!isProd) return

    if (recaptchaLoaded && window.grecaptcha && !recaptchaWidgetId) {
      try {
        const id = window.grecaptcha.render("recaptcha-container", {
          sitekey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI", // This is Google's test key, safe to use in client code
          size: "invisible",
          callback: () => {},
        })
        setRecaptchaWidgetId(id)
      } catch (error) {
        console.error("Error rendering reCAPTCHA:", error)
      }
    }
  }, [recaptchaLoaded, recaptchaWidgetId, isProd])

  // Cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (signupCooldown && cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setSignupCooldown(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [signupCooldown, cooldownTime])

  const executeRecaptcha = async (): Promise<string | null> => {
    // Skip reCAPTCHA in development
    if (!isProd) return "dev-mode-no-captcha"

    if (!recaptchaLoaded || !window.grecaptcha || recaptchaWidgetId === null) {
      toast({
        title: "reCAPTCHA not loaded",
        description: "Please try again in a moment.",
        variant: "destructive",
      })
      return null
    }

    try {
      return await new Promise((resolve) => {
        window.grecaptcha.execute(recaptchaWidgetId, { action: "submit" }).then(resolve)
      })
    } catch (error) {
      console.error("Error executing reCAPTCHA:", error)
      return null
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (signupCooldown) {
      toast({
        title: "Please wait",
        description: `You can try again in ${cooldownTime} seconds.`,
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Get reCAPTCHA token (skipped in development)
      const token = await executeRecaptcha()

      if (isProd && !token) {
        toast({
          title: "CAPTCHA verification failed",
          description: "Please try again.",
          variant: "destructive",
        })
        return
      }

      // Verify token server-side (skipped in development)
      if (isProd) {
        const verificationResult = await verifyRecaptcha(token!)

        if (!verificationResult.success) {
          toast({
            title: "CAPTCHA verification failed",
            description: verificationResult.error || "Please try again.",
            variant: "destructive",
          })
          return
        }
      }

      // Proceed with signup
      const result = await signUpUser(email, password, fullName, token)

      if (!result.success) {
        // If rate limited
        if (result.error?.includes("Too many signup attempts")) {
          setSignupCooldown(true)
          setCooldownTime(60) // 1 minute cooldown
          toast({
            title: "Too many signup attempts",
            description: "Please wait 60 seconds before trying again.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error signing up",
            description: result.error,
            variant: "destructive",
          })
        }
        return
      }

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your sign up.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      })
    } finally {
      if (isProd && recaptchaWidgetId !== null && window.grecaptcha) {
        window.grecaptcha.reset(recaptchaWidgetId)
      }
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push("/feed")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)

      // Get the appropriate redirect URL for the current environment
      const redirectUrl = getRedirectUrl()

      console.log("OAuth redirect URL:", redirectUrl) // For debugging
      console.log("Current hostname:", window.location.hostname) // For debugging

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          // You can add custom query parameters to pass additional info
          queryParams: {
            // Optional: Add a parameter to indicate this is a login attempt
            // This could be used in your callback route if needed
            prompt: "select_account",
          },
        },
      })

      if (error) {
        throw error
      }

      // No need to redirect here as Supabase will handle the redirect
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during Google sign in.",
        variant: "destructive",
      })
      setGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      {isPreview && (
        <Alert className="m-4 bg-amber-900/50 border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-amber-400">Preview Deployment</AlertTitle>
          <AlertDescription className="text-amber-300">
            Google Sign In may not work in preview deployments unless this specific URL has been added to your Google
            OAuth configuration.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="signin">
        <CardHeader className="pb-2">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </CardHeader>

        {/* Google Sign In Button - Shown on both tabs */}
        <div className="px-6 pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
            )}
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>
        </div>

        <div className="px-6 py-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-2 text-xs text-slate-500">OR</span>
            </div>
          </div>
        </div>

        <TabsContent value="signin">
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password" className="text-slate-300">
                    Password
                  </Label>
                  <Link
                    href="/auth/reset-password"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-slate-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
              </div>
              {isProd && <div id="recaptcha-container"></div>}

              {signupCooldown && (
                <div className="text-sm text-amber-400 text-center">
                  Please wait {cooldownTime} seconds before trying again
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || signupCooldown}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

// Add TypeScript interface for window.grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      render: (container: string | HTMLElement, parameters: object) => number
      execute: (widgetId: number, options?: object) => Promise<string>
      reset: (widgetId: number) => void
    }
  }
}
