import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase" // We'll create this type file next

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  console.log("[Supabase Client Init] URL:", supabaseUrl)
  console.log("[Supabase Client Init] Anon Key:", supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing! Check your .env.local file and ensure it's loaded.")
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
