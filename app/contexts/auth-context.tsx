"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated, loginWithEmailPassword, logout, getCurrentUser } from "../lib/auth-utils"
import { UserRole, canAccessRoute, hasPermission } from "@/types/auth"
import { toast } from "@/components/ui/use-toast"

// Define the user data type
export interface UserData {
  id: string
  email: string
  name?: string
  role?: UserRole | string
}

// Define the context type
interface AuthContextType {
  authenticated: boolean
  loading: boolean
  user: UserData | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  loading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
})

// Public routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Check authentication status on mount and when pathname changes
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated()
      setAuthenticated(authStatus)

      // Get user data if authenticated
      if (authStatus) {
        const userData = getCurrentUser()
        setUser(userData)

        // Check if user has access to the current route
        if (userData && pathname && !canAccessRoute(userData.role, pathname)) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          })

          // Redirect to appropriate page based on role
          if (userData.role === UserRole.ADMIN) {
            router.push("/admin")
          } else if (userData.role === UserRole.COMPANY) {
            router.push("/company")
          } else if (userData.role === UserRole.PROMOTER) {
            router.push("/promoter")
          } else {
            router.push("/")
          }
        }
      } else {
        setUser(null)

        // If not authenticated and not on a public route, redirect to login
        if (pathname && !publicRoutes.includes(pathname) && pathname !== "/") {
          router.push("/login")
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  // Login function
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await loginWithEmailPassword(email, password)
      setAuthenticated(true)
      setUser(response.user)

      // Redirect based on role
      if (response.user.role === UserRole.ADMIN) {
        router.push("/admin")
      } else if (response.user.role === UserRole.COMPANY) {
        router.push("/company")
      } else if (response.user.role === UserRole.PROMOTER) {
        router.push("/promoter")
      } else {
        router.push("/contracts")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Logout function
  const handleLogout = async () => {
    await logout()
    setAuthenticated(false)
    setUser(null)
    router.push("/login")
  }

  // Check if user has a specific permission
  const checkPermission = (permission: string): boolean => {
    if (!user || !user.role) return false
    return hasPermission(user.role, permission)
  }

  // Check if user has a specific role
  const checkRole = (role: UserRole | UserRole[]): boolean => {
    if (!user || !user.role) return false

    if (Array.isArray(role)) {
      return role.includes(user.role as UserRole)
    }

    return user.role === role
  }

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        loading,
        user,
        login: handleLogin,
        logout: handleLogout,
        hasPermission: checkPermission,
        hasRole: checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
