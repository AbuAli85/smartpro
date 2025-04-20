"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import MobileNavigation from "./mobile-navigation"
import RealtimeNotificationCenter from "@/components/notification/realtime-notification-center"

export default function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return

      try {
        const supabase = getSupabaseClient()
        const { data } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

        setIsAdmin(data?.role === "admin")
      } catch (error) {
        console.error("Error checking admin status:", error)
      }
    }

    checkAdminStatus()
  }, [user])

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold mr-4">
              Contract Generator
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/dashboard"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/contracts"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith("/contracts")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Contracts
                </Link>
                <Link
                  href="/templates"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith("/templates")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Templates
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname.startsWith("/admin")
                        ? "bg-red-100 text-red-900"
                        : "text-red-500 hover:text-red-900 hover:bg-red-50"
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && <RealtimeNotificationCenter language="en" />}

            <div className="hidden md:block">
              {user ? (
                <Button variant="outline" onClick={() => signOut()}>
                  Sign Out
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>

            <MobileNavigation />
          </div>
        </div>
      </div>
    </nav>
  )
}
