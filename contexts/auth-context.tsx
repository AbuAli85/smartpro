"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient, type Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

// Define user roles
export enum UserRole {
  ADMIN = "admin",
  COMPANY = "company",
  PROMOTER = "promoter",
  USER = "user",
}

// Define the user data type
interface UserData {
  id: string
  email: string
  name?: string
  role?: UserRole
  metadata?: Record<string, any>
}

// Define the auth context type
interface AuthContextType {
  user: UserData | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: Partial<UserData>) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUser: (data: Partial<UserData>) => Promise<void>
  hasRole: (role: UserRole | UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
}

// Create the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance && typeof window !== "undefined") {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Define permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
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

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateUser: async () => {},
  hasRole: () => false,
  hasPermission: () => false,
})

// Create the auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const supabase = getSupabaseClient()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true)

      if (session) {
        // Get user data from the database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (userError && userError.code !== "PGRST116") {
          console.error("Error fetching user data:", userError)
        }

        // Combine auth user with database user data
        const combinedUser: UserData = {
          id: session.user.id,
          email: session.user.email || "",
          name: userData?.name || session.user.user_metadata?.name,
          role: userData?.role || UserRole.USER,
          metadata: {
            ...session.user.user_metadata,
            ...userData,
          },
        }

        setUser(combinedUser)
        setSession(session)

        // Store role in a cookie for server-side access
        document.cookie = `user_role=${combinedUser.role}; path=/; max-age=86400; SameSite=Lax`
      } else {
        setUser(null)
        setSession(null)

        // Clear role cookie
        document.cookie = "user_role=; path=/; max-age=0; SameSite=Lax"
      }

      setLoading(false)
    })

    // Get initial session
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (session) {
        // Get user data from the database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (userError && userError.code !== "PGRST116") {
          console.error("Error fetching user data:", userError)
        }

        // Combine auth user with database user data
        const combinedUser: UserData = {
          id: session.user.id,
          email: session.user.email || "",
          name: userData?.name || session.user.user_metadata?.name,
          role: userData?.role || UserRole.USER,
          metadata: {
            ...session.user.user_metadata,
            ...userData,
          },
        }

        setUser(combinedUser)
        setSession(session)

        // Store role in a cookie for server-side access
        document.cookie = `user_role=${combinedUser.role}; path=/; max-age=86400; SameSite=Lax`
      }

      setLoading(false)
    }

    initializeAuth()

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Redirect will happen automatically via the auth state change listener
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "Failed to sign in")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, userData?: Partial<UserData>) => {
    try {
      setError(null)
      setLoading(true)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData?.name,
            role: userData?.role || UserRole.USER,
            ...userData,
          },
        },
      })

      if (error) {
        throw error
      }

      // Create user record in the database
      if (data.user) {
        const { error: dbError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          name: userData?.name,
          role: userData?.role || UserRole.USER,
        })

        if (dbError) {
          console.error("Error creating user record:", dbError)
        }
      }

      // Redirect will happen automatically via the auth state change listener
    } catch (err: any) {
      console.error("Sign up error:", err)
      setError(err.message || "Failed to sign up")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setError(null)
      setLoading(true)

      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // Clear user data
      setUser(null)
      setSession(null)

      // Clear role cookie
      document.cookie = "user_role=; path=/; max-age=0; SameSite=Lax"

      // Redirect to home page
      router.push("/")
    } catch (err: any) {
      console.error("Sign out error:", err)
      setError(err.message || "Failed to sign out")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setError(null)
      setLoading(true)

      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }
    } catch (err: any) {
      console.error("Reset password error:", err)
      setError(err.message || "Failed to reset password")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update user function
  const updateUser = async (data: Partial<UserData>) => {
    try {
      setError(null)
      setLoading(true)

      if (!user) {
        throw new Error("No user logged in")
      }

      const supabase = getSupabaseClient()

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          ...data.metadata,
        },
      })

      if (authError) {
        throw authError
      }

      // Update user record in the database
      const { error: dbError } = await supabase
        .from("users")
        .update({
          name: data.name,
          role: data.role,
          ...data,
        })
        .eq("id", user.id)

      if (dbError) {
        throw dbError
      }

      // Update local user state
      setUser({
        ...user,
        ...data,
      })

      // Update role cookie if role changed
      if (data.role) {
        document.cookie = `user_role=${data.role}; path=/; max-age=86400; SameSite=Lax`
      }
    } catch (err: any) {
      console.error("Update user error:", err)
      setError(err.message || "Failed to update user")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Check if user has a specific role
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user || !user.role) return false

    if (Array.isArray(role)) {
      return role.includes(user.role as UserRole)
    }

    return user.role === role
  }

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role) return false

    const userRole = user.role as UserRole
    const permissions = ROLE_PERMISSIONS[userRole]

    return permissions ? permissions.includes(permission) : false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateUser,
        hasRole,
        hasPermission,
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
