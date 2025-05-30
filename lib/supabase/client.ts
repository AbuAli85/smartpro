import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  // Ensure no debugging console.logs are left here from previous steps
  // if they were added.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "CRITICAL: Supabase URL or Anon Key is MISSING or UNDEFINED in .env.local. Ensure NEXT_PUBLIC_ prefix is used and server is restarted.",
    )
    // Optionally throw an error to halt execution if essential vars are missing
    // throw new Error("Supabase client initialization failed: URL or Anon Key is missing.");
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
