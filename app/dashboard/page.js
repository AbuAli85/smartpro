"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Dashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Check if user is authenticated using localStorage
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    const email = localStorage.getItem("userEmail") || ""

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push(`/login?redirectedFrom=/dashboard`)
    } else {
      setUserEmail(email)
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    // Clear authentication state
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    // Redirect to home
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Logged in as: {userEmail}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">Recent Contracts</h2>
            <p className="text-gray-600">You have no contracts yet.</p>
          </div>

          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">Templates</h2>
            <p className="text-gray-600">No templates available.</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <Link
            href="/new-contract"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Create New Contract
          </Link>

          <Link href="/" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
