"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldAlert, UserCheck, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserWithRole {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
}

interface RoleAssignmentDialogProps {
  user: UserWithRole
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoleAssigned: () => void
}

export default function RoleAssignmentDialog({ user, open, onOpenChange, onRoleAssigned }: RoleAssignmentDialogProps) {
  const [selectedRole, setSelectedRole] = useState(user.role.toLowerCase())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (selectedRole === user.role.toLowerCase()) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)

    try {
      // Call the assign-role Edge Function
      const response = await fetch("/api/admin/assign-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          role: selectedRole,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to assign role")
      }

      toast({
        title: "Role updated",
        description: `${user.email} is now a ${selectedRole}.`,
        variant: "default",
      })

      onRoleAssigned()
      onOpenChange(false)
    } catch (error) {
      console.error("Error assigning role:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign role. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>Assign a new role to {user.full_name || user.email}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-4">
            <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
              <RadioGroupItem value="user" id="user" />
              <Label htmlFor="user" className="flex flex-1 items-center gap-2 font-normal">
                <User className="h-4 w-4 text-gray-500" />
                <div className="space-y-1">
                  <p>User</p>
                  <p className="text-xs text-muted-foreground">Can create and manage their own contracts</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
              <RadioGroupItem value="approver" id="approver" />
              <Label htmlFor="approver" className="flex flex-1 items-center gap-2 font-normal">
                <UserCheck className="h-4 w-4 text-blue-500" />
                <div className="space-y-1">
                  <p>Approver</p>
                  <p className="text-xs text-muted-foreground">Can approve or reject contract templates</p>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
              <RadioGroupItem value="admin" id="admin" />
              <Label htmlFor="admin" className="flex flex-1 items-center gap-2 font-normal">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <div className="space-y-1">
                  <p>Admin</p>
                  <p className="text-xs text-muted-foreground">
                    Full access to all system features and user management
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
