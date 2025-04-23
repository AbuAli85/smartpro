/**
 * Authentication utilities for Supabase Auth
 * Handles token management, authentication headers, and refresh logic
 */

import { createClient } from "@supabase/supabase-js"
import { STORAGE_KEYS } from "./lovable-auth-config"
import { UserRole } from "@/types/auth"

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Initialize Supabase client
export function getSupabaseClient() {
  if (!supabaseInstance && typeof window !== "undefined") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables")
      return null
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

/**
 * Clear stored authentication tokens
 */
export function clearAuthTokens(): void {
  if (typeof window === "undefined") return

  const supabase = getSupabaseClient()
  if (supabase) {
    // Sign out from Supabase
    supabase.auth.signOut()
  }

  // Clear local storage items
  localStorage.removeItem(STORAGE_KEYS.USER_DATA)
}

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === "undefined") return false

  const supabase = getSupabaseClient()
  if (!supabase) return false

  // Check if we have a session using getSession() which returns a Promise
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

/**
 * Get authentication headers for API requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      "Content-Type": "application/json",
    }
  }

  // Get session using getSession()
  const { data } = await supabase.auth.getSession()
  const session = data.session

  if (!session) {
    return {
      "Content-Type": "application/json",
    }
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  }
}

/**
 * Login user with email and password
 */
export async function loginWithEmailPassword(email: string, password: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (userError) {
      console.error("Error fetching user role:", userError)
    }

    // Store user data in local storage for easy access
    if (data.user) {
      localStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
          role: userData?.role || data.user.user_metadata?.role || UserRole.USER,
        }),
      )
    }

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

/**
 * Register a new user
 */
export async function registerUser(email: string, password: string, name: string, role: UserRole = UserRole.USER) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

/**
 * Logout user
 */
export async function logout() {
  const supabase = getSupabaseClient()
  if (!supabase) return

  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    // Clear local storage
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  }
}

/**
 * Get current user data
 */
export async function getCurrentUser() {
  if (typeof window === "undefined") return null

  const supabase = getSupabaseClient()
  if (!supabase) return null

  // Use getUser() instead of user()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) return null

  // Get user role from database
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, name")
    .eq("id", user.id)
    .single()

  if (userError) {
    console.error("Error fetching user data:", userError)
  }

  // Return user data with role from database
  return {
    id: user.id,
    email: user.email,
    name: userData?.name || user.user_metadata?.name,
    role: userData?.role || user.user_metadata?.role || UserRole.USER,
  }
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  // Get session using getSession()
  const { data } = await supabase.auth.getSession()
  const session = data.session

  return session?.access_token || null
}
