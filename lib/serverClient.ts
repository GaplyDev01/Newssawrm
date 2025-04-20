"use server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function makeClient() {
  const store = cookies()
  return createServerClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get: (n) => store.get(n)?.value,
      set: (n, v, opts) => store.set({ name: n, value: v, ...opts }),
      delete: (n) => store.delete(n),
    },
  })
}
