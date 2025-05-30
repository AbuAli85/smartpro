import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

export function createSupabaseServerAdminClient() {
  // Note: Using service_role key on the server for admin tasks.
  // Ensure this key is properly secured and only used in server-side environments.
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set for admin client.")
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey, // Use service role key here
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      cookies: {
        // Dummy cookies for server client not using user context
        get(name: string) {
          return undefined
        },
        set(name: string, value: string, options: CookieOptions) {},
        remove(name: string, options: CookieOptions) {},
      },
    },
  )
}
