import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SettingsSidebar } from "@/components/settings/settings-sidebar"
import { AccountSettings } from "@/components/settings/account-settings"

export default async function SettingsPage() {
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

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and platform preferences</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SettingsSidebar />

        <div className="flex-1 overflow-auto p-6">
          <AccountSettings user={user} profile={profile} />
        </div>
      </div>
    </div>
  )
}
