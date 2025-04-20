"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { UserRole } from "@/types/template"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface UserContextType {
  currentUser: User | null
  isLoading: boolean
  isApprover: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUserRole: (role: UserRole) => void
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  currentUser: null,
  isLoading: true,
  isApprover: false,
  isAdmin: false,
  login: async () => false,
  logout: () => {},
  updateUserRole: () => {},
})

// Sample users for demo purposes
const SAMPLE_USERS = [
  {
    id: "user-1",
    name: "Regular User",
    email: "user@example.com",
    password: "password",
    role: UserRole.User,
  },
  {
    id: "approver-1",
    name: "Template Approver",
    email: "approver@example.com",
    password: "password",
    role: UserRole.Approver,
  },
  {
    id: "admin-1",
    name: "System Admin",
    email: "admin@example.com",
    password: "password",
    role: UserRole.Admin,
  },
]

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("currentUser")
      }
    }
    setIsLoading(false)
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call
    const user = SAMPLE_USERS.find((u) => u.email === email && u.password === password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      setCurrentUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  // Logout function
  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUser")
  }

  // Update user role (for demo purposes)
  const updateUserRole = (role: UserRole) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, role }
      setCurrentUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }

  // Computed properties
  const isApprover = currentUser?.role === UserRole.Approver || currentUser?.role === UserRole.Admin
  const isAdmin = currentUser?.role === UserRole.Admin

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        isApprover,
        isAdmin,
        login,
        logout,
        updateUserRole,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// Custom hook to use the user context
export function useUser() {
  return useContext(UserContext)
}
