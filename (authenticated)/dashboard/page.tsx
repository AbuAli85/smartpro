import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { ClientDashboard } from "@/components/dashboard/client/client-dashboard"
import { ProviderDashboard } from "@/components/dashboard/provider/provider-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  if (!session.user.role) {
    redirect("/role-selection")
  }

  switch (session.user.role) {
    case "ADMIN":
      return <AdminDashboard />
    case "PROVIDER":
      return <ProviderDashboard />
    case "CLIENT":
      return <ClientDashboard />
    default:
      redirect("/unauthorized")
  }
}

