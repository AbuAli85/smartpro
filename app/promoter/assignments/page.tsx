import { Header } from "@/app/components/header"
import RoleGuard from "@/app/components/role-guard"
import { UserRole } from "@/types/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PromoterAssignmentsPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROMOTER]}>
      <Header />
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Assignments</h1>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Contracts</CardTitle>
              <CardDescription>View and manage your assigned promotion contracts</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Assignments content here */}
              <p>Your assigned contracts will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
