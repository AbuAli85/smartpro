import { type UserRole, ROLE_PERMISSIONS } from "@/types/auth"

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}

// Helper function to check if a role has a specific permission
export function hasPermission(role: UserRole | string | undefined, permission: string): boolean {
  if (!role) return false

  // Convert string role to enum if needed
  const userRole = typeof role === "string" ? (role as UserRole) : role

  // Get permissions for the role
  const permissions = ROLE_PERMISSIONS[userRole]

  // Check if the permission exists in the role's permissions
  return permissions ? permissions.includes(permission) : false
}
