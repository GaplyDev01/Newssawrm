import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/")
  ) {
    return res
  }

  // Create a Supabase client for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // If the cookie is updated, update the request and response
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: "",
            ...options,
          })
          res.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Debug: Log session state and requested path
  console.log(`Middleware: Path=${pathname}, Session=${!!session}`)

  // If no session and trying to access protected routes
  if (
    !session &&
    (pathname.startsWith("/feed") ||
      pathname.startsWith("/saved") ||
      pathname.startsWith("/crypto") ||
      pathname.startsWith("/alerts") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/article"))
  ) {
    const redirectUrl = new URL("/auth", req.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If trying to access admin routes, check if user is admin
  if (session && pathname.startsWith("/admin")) {
    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // If not admin, redirect to feed
    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/feed", req.url))
    }
  }

  // If session and trying to access auth page
  if (session && pathname.startsWith("/auth")) {
    // Check if there's a redirect parameter
    const redirectTo = req.nextUrl.searchParams.get("redirect")
    const redirectUrl = new URL(redirectTo || "/feed", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
