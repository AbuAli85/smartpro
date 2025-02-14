import type { Metadata } from "next"
import { AdminStats } from "@/components/admin/admin-stats"
import { UserManagement } from "@/components/admin/user-management"
import { ServiceManagement } from "@/components/admin/service-management"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "SmartPRO Admin Dashboard",
}

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid gap-8">
        <AdminStats />
        <UserManagement />
        <ServiceManagement />
      </div>
    </div>
  )
}

