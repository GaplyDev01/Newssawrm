import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

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

  // If no session and trying to access protected routes
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/feed") ||
      req.nextUrl.pathname.startsWith("/saved") ||
      req.nextUrl.pathname.startsWith("/crypto") ||
      req.nextUrl.pathname.startsWith("/alerts") ||
      req.nextUrl.pathname.startsWith("/settings") ||
      req.nextUrl.pathname.startsWith("/admin"))
  ) {
    const redirectUrl = new URL("/auth", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If trying to access admin routes, check if user is admin
  if (session && req.nextUrl.pathname.startsWith("/admin")) {
    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // If not admin, redirect to feed
    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/feed", req.url))
    }
  }

  // If session and trying to access auth page
  if (session && req.nextUrl.pathname.startsWith("/auth")) {
    const redirectUrl = new URL("/feed", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/saved/:path*",
    "/crypto/:path*",
    "/alerts/:path*",
    "/settings/:path*",
    "/auth/:path*",
    "/admin/:path*",
  ],
}
