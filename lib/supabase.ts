// Re-export the Supabase client from supabase-client.ts for backward compatibility
import { supabase } from "./supabase-client"

// Export the Supabase client as a named export
export { supabase }

// Also export as default for backward compatibility
export default supabase
