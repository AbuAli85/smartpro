import { Suspense } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserTable } from "@/components/users/user-table"
import { UserTableSkeleton } from "@/components/users/user-table-skeleton"

export default function UsersPage() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <Suspense fallback={<UserTableSkeleton />}>
        <UserTable />
      </Suspense>
    </DashboardLayout>
  )
}

