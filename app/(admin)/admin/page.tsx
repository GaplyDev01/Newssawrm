import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminStats } from "@/components/admin/admin-stats"
import { RecentArticles } from "@/components/admin/recent-articles"
import { UserSegmentsVisualization } from "@/components/admin/user-segments-visualization"

export default async function AdminDashboard() {
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

  // Get stats
  const { count: articlesCount } = await supabase.from("news_articles").select("*", { count: "exact", head: true })

  const { count: sourcesCount } = await supabase.from("news_sources").select("*", { count: "exact", head: true })

  const { count: alertsCount } = await supabase.from("alerts").select("*", { count: "exact", head: true })

  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your news platform</p>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <AdminStats
          articlesCount={articlesCount || 0}
          sourcesCount={sourcesCount || 0}
          alertsCount={alertsCount || 0}
          usersCount={usersCount || 0}
        />

        <Tabs defaultValue="recent" className="w-full">
          <TabsList>
            <TabsTrigger value="recent">Recent Articles</TabsTrigger>
            <TabsTrigger value="segments">User Segments</TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="mt-4">
            <RecentArticles />
          </TabsContent>
          <TabsContent value="segments" className="mt-4">
            <UserSegmentsVisualization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
