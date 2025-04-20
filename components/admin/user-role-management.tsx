"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserCog, RefreshCw, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import RoleAssignmentDialog from "@/components/admin/role-assignment-dialog"

interface UserWithRole {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
}

export default function UserRoleManagement({ adminId }: { adminId: string }) {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const { toast } = useToast()

  // Fetch users with roles
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()

      // Call the RPC function to get users with roles
      const { data, error } = await supabase.rpc("get_users_with_roles")

      if (error) {
        throw error
      }

      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          (user.full_name && user.full_name.toLowerCase().includes(query)) ||
          user.role.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  // Handle role assignment
  const handleRoleAssignment = (user: UserWithRole) => {
    setSelectedUser(user)
    setIsRoleDialogOpen(true)
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString()
  }

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return (
          <Badge variant="default" className="bg-red-500">
            Admin
          </Badge>
        )
      case "approver":
        return (
          <Badge variant="default" className="bg-blue-500">
            Approver
          </Badge>
        )
      default:
        return <Badge variant="outline">User</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          <span>User Role Management</span>
        </CardTitle>
        <CardDescription>Manage user roles and permissions for the contract system</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search users by email, name or role..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
            <p>No users found matching your search criteria.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || "-"}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleAssignment(user)}
                        disabled={user.id === adminId} // Prevent changing own role
                      >
                        Change Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Role Assignment Dialog */}
        {selectedUser && (
          <RoleAssignmentDialog
            user={selectedUser}
            open={isRoleDialogOpen}
            onOpenChange={setIsRoleDialogOpen}
            onRoleAssigned={() => {
              fetchUsers()
              setSelectedUser(null)
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
