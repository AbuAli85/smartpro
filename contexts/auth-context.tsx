"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { identifyUser, clearUserIdentity } from "@/utils/error-tracking"

interface User {
  id: string
  email: string
  role?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Get user profile data including role
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("user_id", session.user.id)
            .single()

          const userData = {
            id: session.user.id,
            email: session.user.email!,
            role: profile?.role || "user",
          }

          setUser(userData)

          // Identify user in Sentry
          identifyUser(userData)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Get user profile data including role
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()

        const userData = {
          id: session.user.id,
          email: session.user.email!,
          role: profile?.role || "user",
        }

        setUser(userData)

        // Identify user in Sentry
        identifyUser(userData)
      } else if (event === "SIGNED_OUT") {
        setUser(null)

        // Clear user identity in Sentry
        clearUserIdentity()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")

      // Clear user identity in Sentry
      clearUserIdentity()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
