"use client"

import { Header } from "@/app/components/header"
import RoleGuard from "@/app/components/role-guard"
import { UserRole } from "@/types/auth"
import RegistrationForm from "@/app/components/registration-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function CreateUserPage() {
  const { toast } = useToast()
  const router = useRouter()

  const handleSuccess = () => {
    toast({
      title: "User Created",
      description: "The user has been successfully created.",
    })

    // Redirect to users page
    router.push("/admin/users")
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <Header />
      <div className="container py-10">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>Add a new user to the system with a specific role</CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationForm allowRoleSelection={true} defaultRole={UserRole.USER} onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
