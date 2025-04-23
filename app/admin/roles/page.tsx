"use client"

import { useState } from "react"
import { Header } from "@/app/components/header"
import RoleGuard from "@/app/components/role-guard"
import { UserRole } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"

// Define permissions
const allPermissions = [
  { id: "view_contracts", name: "View Contracts", description: "Can view contracts" },
  { id: "create_contracts", name: "Create Contracts", description: "Can create new contracts" },
  { id: "edit_contracts", name: "Edit Contracts", description: "Can edit existing contracts" },
  { id: "delete_contracts", name: "Delete Contracts", description: "Can delete contracts" },
  { id: "view_users", name: "View Users", description: "Can view user list" },
  { id: "manage_users", name: "Manage Users", description: "Can create, edit, and delete users" },
  { id: "view_analytics", name: "View Analytics", description: "Can view analytics data" },
  { id: "access_admin_panel", name: "Access Admin Panel", description: "Can access admin panel" },
  { id: 'manage_placeholders  name: "Access Admin Panel', description: "Can access admin panel" },
  { id: "manage_placeholders", name: "Manage Placeholders", description: "Can manage form placeholders" },
  {
    id: "regenerate_contract_json",
    name: "Regenerate Contract JSON",
    description: "Can regenerate contract JSON for Figma",
  },
]

// Define initial role permissions
const initialRolePermissions = {
  [UserRole.ADMIN]: allPermissions.map((p) => p.id),
  [UserRole.COMPANY]: ["view_contracts", "create_contracts", "edit_own_contracts", "view_own_analytics"],
  [UserRole.PROMOTER]: ["view_assigned_contracts", "update_profile"],
  [UserRole.USER]: ["view_public_contracts"],
}

export default function RoleManagementPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <Header />
      <div className="container py-10">
        <div className="max-w-6xl mx-auto">
          <RoleManagement />
        </div>
      </div>
    </RoleGuard>
  )
}

function RoleManagement() {
  const [rolePermissions, setRolePermissions] = useState({ ...initialRolePermissions })
  const [saving, setSaving] = useState(false)

  // Toggle permission for a role
  const togglePermission = (role: UserRole, permissionId: string) => {
    setRolePermissions((prev) => {
      const rolePerms = [...prev[role]]

      if (rolePerms.includes(permissionId)) {
        return {
          ...prev,
          [role]: rolePerms.filter((id) => id !== permissionId),
        }
      } else {
        return {
          ...prev,
          [role]: [...rolePerms, permissionId],
        }
      }
    })
  }

  // Save role permissions
  const saveRolePermissions = async () => {
    setSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Success",
        description: "Role permissions saved successfully.",
      })
    } catch (error) {
      console.error("Error saving role permissions:", error)
      toast({
        title: "Error",
        description: "Failed to save role permissions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Configure permissions for each role</p>
        </div>
        <Button onClick={saveRolePermissions} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Define which permissions are granted to each role in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Permission</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Admin</TableHead>
                <TableHead className="text-center">Company</TableHead>
                <TableHead className="text-center">Promoter</TableHead>
                <TableHead className="text-center">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.name}</TableCell>
                  <TableCell>{permission.description}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={rolePermissions[UserRole.ADMIN].includes(permission.id)}
                      onCheckedChange={() => togglePermission(UserRole.ADMIN, permission.id)}
                      disabled={permission.id === "access_admin_panel"} // Admin always has admin access
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={rolePermissions[UserRole.COMPANY].includes(permission.id)}
                      onCheckedChange={() => togglePermission(UserRole.COMPANY, permission.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={rolePermissions[UserRole.PROMOTER].includes(permission.id)}
                      onCheckedChange={() => togglePermission(UserRole.PROMOTER, permission.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={rolePermissions[UserRole.USER].includes(permission.id)}
                      onCheckedChange={() => togglePermission(UserRole.USER, permission.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Role Descriptions</CardTitle>
            <CardDescription>Overview of each role and its intended use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Admin</h3>
                <p className="text-muted-foreground">
                  System administrators with full access to all features and settings. Can manage users, roles, and all
                  system configurations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Company</h3>
                <p className="text-muted-foreground">
                  Company representatives who can create and manage contracts. They have access to their company's data
                  and can manage promoters.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Promoter</h3>
                <p className="text-muted-foreground">
                  Promoters who are assigned to contracts. They can view their assigned contracts and update their
                  profile.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">User</h3>
                <p className="text-muted-foreground">
                  Basic users with limited access. They can view public contracts and their own profile.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
