import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { RoleSelection } from "@/components/role-selection"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function RoleSelectionPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  // If user already has a role, redirect to dashboard
  if (session.user.role) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to SmartPRO</CardTitle>
          <CardDescription>Please select your role to continue to your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleSelection userId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  )
}

