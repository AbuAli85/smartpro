import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase" // We'll create this type file next

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  // ADD THESE LINES if they aren't there
  console.log("[Supabase Client Init] URL:", supabaseUrl)
  console.log("[Supabase Client Init] Anon Key:", supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing! Check your .env.local file and ensure it's loaded.")
    // You could throw an error here or return a dummy client to prevent further issues
    // For now, logging an error is a good first step.
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
