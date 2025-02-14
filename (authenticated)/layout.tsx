import { headers } from "next/headers"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ClientAuthProvider } from "@/components/providers/client-auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import type React from "react"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const headersList = headers()
  const pathname = headersList.get("x-pathname") || "/"

  if (!session) {
    redirect(`/signin?from=${encodeURIComponent(pathname)}`)
  }

  // Get required role based on pathname
  let requiredRole = null
  if (pathname.startsWith("/dashboard/admin")) {
    requiredRole = "ADMIN"
  } else if (pathname.startsWith("/dashboard/provider")) {
    requiredRole = "PROVIDER"
  } else if (pathname.startsWith("/dashboard/client")) {
    requiredRole = "CLIENT"
  }

  return (
    <ClientAuthProvider session={session}>
      <ProtectedRoute requiredRole={requiredRole}>
        <DashboardLayout user={session.user}>{children}</DashboardLayout>
      </ProtectedRoute>
    </ClientAuthProvider>
  )
}

