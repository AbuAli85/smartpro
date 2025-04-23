import { Header } from "../components/header"
import RoleGuard from "../components/role-guard"
import { UserRole } from "@/types/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Settings, Users } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <Header />
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Contract Administration</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <PlusCircle className="h-6 w-6 text-primary mr-2" />
                <h2 className="text-xl font-semibold">Create New Contract</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Create a new bilingual contract with customizable fields and document uploads.
              </p>
              <Button asChild>
                <Link href="/admin/create">Create Contract</Link>
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-primary mr-2" />
                <h2 className="text-xl font-semibold">View Contracts</h2>
              </div>
              <p className="text-gray-600 mb-4">View and manage all existing contracts in the system.</p>
              <Button asChild variant="outline">
                <Link href="/contracts">View All Contracts</Link>
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <Settings className="h-6 w-6 text-primary mr-2" />
                <h2 className="text-xl font-semibold">Form Settings</h2>
              </div>
              <p className="text-gray-600 mb-4">Customize form labels and placeholders for different forms.</p>
              <Button asChild variant="outline">
                <Link href="/admin/placeholders">Manage Placeholders</Link>
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-primary mr-2" />
                <h2 className="text-xl font-semibold">User Management</h2>
              </div>
              <p className="text-gray-600 mb-4">Manage users, roles, and permissions.</p>
              <Button asChild variant="outline">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
