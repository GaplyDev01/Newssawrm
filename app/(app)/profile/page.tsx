import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { ProfileForm } from "@/components/profile/profile-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PreferencesForm } from "@/components/profile/preferences-form"
import { NotificationsForm } from "@/components/profile/notifications-form"

export default async function ProfilePage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get the user's profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get the user's preferences
  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <ProfileForm user={user} profile={profile} />
            </TabsContent>
            <TabsContent value="preferences" className="mt-6">
              <PreferencesForm user={user} preferences={preferences} />
            </TabsContent>
            <TabsContent value="notifications" className="mt-6">
              <NotificationsForm user={user} preferences={preferences} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
