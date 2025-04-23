"use client"

import { useAuth, UserRole } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, User, Building, Megaphone } from "lucide-react"

export function UserProfile() {
  const { user, signOut, hasRole, hasPermission } = useAuth()

  if (!user) {
    return null
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasRole(UserRole.ADMIN) && <Shield className="h-5 w-5 text-primary" />}
          {hasRole(UserRole.COMPANY) && <Building className="h-5 w-5 text-primary" />}
          {hasRole(UserRole.PROMOTER) && <Megaphone className="h-5 w-5 text-primary" />}
          {hasRole(UserRole.USER) && <User className="h-5 w-5 text-primary" />}
          {user.name || user.email}
        </CardTitle>
        <CardDescription>
          {hasRole(UserRole.ADMIN) && "Administrator"}
          {hasRole(UserRole.COMPANY) && "Company Account"}
          {hasRole(UserRole.PROMOTER) && "Promoter Account"}
          {hasRole(UserRole.USER) && "User Account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Email</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div>
          <p className="text-sm font-medium">Role</p>
          <p className="text-sm text-muted-foreground">{user.role}</p>
        </div>

        <div>
          <p className="text-sm font-medium">Permissions</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {hasRole(UserRole.ADMIN) && (
              <>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Admin Access
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Manage Users
                </span>
              </>
            )}

            {hasPermission("create_contracts") && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Create Contracts
              </span>
            )}

            {hasPermission("view_contracts") && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                View Contracts
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => signOut()}>
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  )
}
