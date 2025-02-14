import { Suspense } from "react"
import { UserManagementTable } from "@/components/admin/user-management-table"
import { LoadingState } from "@/components/ui/loading-state"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">User Management</h1>
      <Suspense fallback={<LoadingState />}>
        <UserManagementTable />
      </Suspense>
    </div>
  )
}

