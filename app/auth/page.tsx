import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"

export default async function AuthPage() {
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
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/feed")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <AuthForm />
    </div>
  )
}
