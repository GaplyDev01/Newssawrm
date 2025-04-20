import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { UserManagement } from "@/components/admin/user-management"

export default async function UsersPage() {
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

  // Get initial users data
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <UserManagement initialUsers={users || []} />
      </div>
    </div>
  )
}
