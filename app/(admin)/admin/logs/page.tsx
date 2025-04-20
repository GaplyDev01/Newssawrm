import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { ErrorLogsList } from "@/components/admin/error-logs-list"
import { LogLevel } from "@/lib/error-logger"

export default async function LogsPage() {
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

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return {
      redirect: {
        destination: "/feed",
        permanent: false,
      },
    }
  }

  // Get recent error logs
  const { data: logs } = await supabase
    .from("error_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100)

  // Count logs by level
  const errorCount = logs?.filter((log) => log.level === LogLevel.ERROR).length || 0
  const warningCount = logs?.filter((log) => log.level === LogLevel.WARNING).length || 0
  const infoCount = logs?.filter((log) => log.level === LogLevel.INFO).length || 0

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Error Logs</h1>
        <p className="text-muted-foreground mt-1">Monitor and analyze application errors</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <ErrorLogsList
          initialLogs={logs || []}
          errorCount={errorCount}
          warningCount={warningCount}
          infoCount={infoCount}
        />
      </div>
    </div>
  )
}
