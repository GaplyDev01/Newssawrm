import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the request is for a protected route
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/feed") ||
    req.nextUrl.pathname.startsWith("/article") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/alerts") ||
    req.nextUrl.pathname.startsWith("/saved") ||
    req.nextUrl.pathname.startsWith("/admin")

  // Check if the request is for an auth route
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing an auth route with a session, redirect to feed
  if (isAuthRoute && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/feed"
    return NextResponse.redirect(redirectUrl)
  }

  // Check if the request is for an admin route
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Get the user's profile to check their role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session?.user.id).single()

    // If the user is not an admin, redirect to the feed
    if (!profile || profile.role !== "admin") {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/feed"
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/article/:path*",
    "/profile/:path*",
    "/alerts/:path*",
    "/saved/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
}
