import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { AuthForm } from "@/components/auth/auth-form"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const supabase = createClient()

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    redirect(searchParams.redirect || "/feed")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Create a new account</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Or{" "}
          <a href="/login" className="font-medium text-primary hover:text-primary/90">
            sign in to your existing account
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <AuthForm type="signup" redirectTo={searchParams.redirect} />
        </div>
      </div>
    </div>
  )
}
