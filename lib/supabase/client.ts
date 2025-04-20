import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a single instance of the Supabase client for use on the client side
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>()
  }
  return clientInstance
}
