import { Suspense } from "react"
import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminPanelSkeleton from "@/components/admin/admin-panel-skeleton"
import AdminPanel from "@/components/admin/admin-panel"

export default async function AdminPage() {
  const supabase = getSupabaseServer()

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectTo=/admin")
  }

  // Check if user has admin role
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", session.user.id).single()

  // If not admin, redirect to dashboard
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <Suspense fallback={<AdminPanelSkeleton />}>
        <AdminPanel userId={session.user.id} />
      </Suspense>
    </main>
  )
}
