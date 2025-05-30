import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase" // We'll create this type file next

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  console.log("NEXT_PUBLIC_SUPABASE_URL from client.ts:", supabaseUrl)
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY from client.ts:", supabaseAnonKey)
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
