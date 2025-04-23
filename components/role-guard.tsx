"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
}

export function RoleGuard({ children, allowedRoles, fallbackPath = "/" }: RoleGuardProps) {
  const { user, loading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait until auth is checked
    if (loading) return

    // If not authenticated, redirect to login
    if (!user) {
      router.push("/login")
      return
    }

    // If authenticated but not allowed role, redirect
    if (!allowedRoles.some((role) => hasRole(role))) {
      router.push(fallbackPath)
    }
  }, [user, loading, hasRole, router, allowedRoles, fallbackPath])

  // Show loading state while checking
  if (loading || !user || !allowedRoles.some((role) => hasRole(role))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Render children if authorized
  return <>{children}</>
}
