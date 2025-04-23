// Define available user roles
export enum UserRole {
  ADMIN = "admin",
  COMPANY = "company",
  PROMOTER = "promoter",
  USER = "user",
}

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    "view_contracts",
    "create_contracts",
    "edit_contracts",
    "delete_contracts",
    "view_users",
    "manage_users",
    "view_analytics",
    "access_admin_panel",
    "manage_placeholders",
    "regenerate_contract_json",
  ],
  [UserRole.COMPANY]: ["view_contracts", "create_contracts", "edit_own_contracts", "view_own_analytics"],
  [UserRole.PROMOTER]: ["view_assigned_contracts", "update_profile"],
  [UserRole.USER]: ["view_public_contracts"],
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

// Helper to check if a user has access to a specific route
export function canAccessRoute(role: UserRole | string | undefined, route: string): boolean {
  if (!role) return false

  // Define route access by role
  const ROUTE_ACCESS = {
    "/admin": [UserRole.ADMIN],
    "/admin/create": [UserRole.ADMIN],
    "/admin/placeholders": [UserRole.ADMIN],
    "/admin/edit": [UserRole.ADMIN],
    "/contracts": [UserRole.ADMIN, UserRole.COMPANY, UserRole.PROMOTER],
    "/edge-functions": [UserRole.ADMIN],
    "/company": [UserRole.ADMIN, UserRole.COMPANY],
    "/promoter": [UserRole.ADMIN, UserRole.PROMOTER],
  }

  // Check if the route exists in the mapping
  const allowedRoles = Object.entries(ROUTE_ACCESS).find(([path]) => route.startsWith(path))?.[1]

  // If route is not restricted or user's role is in allowed roles
  return !allowedRoles || allowedRoles.includes(role as UserRole)
}
