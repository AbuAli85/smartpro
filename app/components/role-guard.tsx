"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/auth-context"
import type { UserRole } from "@/types/auth"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
}

export default function RoleGuard({ children, allowedRoles, fallbackPath = "/" }: RoleGuardProps) {
  const { authenticated, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait until auth is checked
    if (loading) return

    // If not authenticated, redirect to login
    if (!authenticated) {
      router.push("/login")
      return
    }

    // If authenticated but no role or not allowed role, redirect
    if (!user?.role || !allowedRoles.includes(user.role as UserRole)) {
      router.push(fallbackPath)
    }
  }, [authenticated, loading, user, router, allowedRoles, fallbackPath])

  // Show loading state while checking
  if (loading || !authenticated || !user?.role || !allowedRoles.includes(user.role as UserRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Render children if authorized
  return <>{children}</>
}
