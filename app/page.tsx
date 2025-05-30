import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }

  // This component will effectively not render anything itself
  // as the redirect will happen on the server.
  // However, to satisfy React's requirement for a return,
  // you can return null or a simple loading indicator,
  // though it's unlikely to be seen.
  return null
}
