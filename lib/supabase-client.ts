import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Create a singleton instance to avoid multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export const createClient = () => {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseInstance
}

// Export a direct reference to the Supabase client for convenience
export const supabase = createClient()

// Also export as default for backward compatibility
export default supabase
