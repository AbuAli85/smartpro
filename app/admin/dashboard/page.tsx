import { Header } from "@/app/components/header"
import RoleGuard from "@/app/components/role-guard"
import { UserRole } from "@/types/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCog, Shield, Users, Settings, FileText, PlusCircle } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <Header />
      <div className="container py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage users and their accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create, edit, and delete user accounts. Manage user information and access.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/admin/users">Manage Users</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Role Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Role Management
                </CardTitle>
                <CardDescription>Configure roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Define which permissions are granted to each role in the system.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/admin/roles">Manage Roles</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Contract Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Contract Management
                </CardTitle>
                <CardDescription>Manage all contracts in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View, create, edit, and delete contracts. Manage contract approvals and status.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline">
                  <Link href="/contracts">View Contracts</Link>
                </Button>
                <Button asChild>
                  <Link href="/admin/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* System Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage form placeholders, templates, and other system configurations.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/admin/placeholders">Manage Settings</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* API Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCog className="mr-2 h-5 w-5" />
                  API Management
                </CardTitle>
                <CardDescription>Manage API keys and integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create and manage API keys for external integrations like Figma.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/admin/api-keys">Manage API Keys</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
