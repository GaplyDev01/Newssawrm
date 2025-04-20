import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Create a singleton instance to avoid multiple GoTrueClient instances
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Export the supabase client as a named export
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

// Also export as default for backward compatibility
export default supabase
