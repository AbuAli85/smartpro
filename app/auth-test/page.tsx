"use client"

import { useEffect, useState } from "react"
import { Header } from "@/app/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient, getCurrentUser, logout } from "@/app/lib/auth-utils"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function AuthTestPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sessionStatus, setSessionStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const [testResults, setTestResults] = useState<Array<{ name: string; success: boolean; message: string }>>([])

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
        setSessionStatus(userData ? "authenticated" : "unauthenticated")
      } catch (error) {
        console.error("Error checking auth:", error)
        setSessionStatus("unauthenticated")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const runAuthTests = async () => {
    setLoading(true)
    const results = []

    // Test 1: Check if Supabase client is initialized
    try {
      const supabase = getSupabaseClient()
      results.push({
        name: "Supabase Client Initialization",
        success: !!supabase,
        message: supabase ? "Supabase client initialized successfully" : "Failed to initialize Supabase client",
      })
    } catch (error) {
      results.push({
        name: "Supabase Client Initialization",
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
    }

    // Test 2: Check if session exists
    try {
      const supabase = getSupabaseClient()
      const { data } = await supabase!.auth.getSession()
      results.push({
        name: "Session Check",
        success: !!data.session,
        message: data.session
          ? `Session exists, expires at: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`
          : "No active session found",
      })
    } catch (error) {
      results.push({
        name: "Session Check",
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
    }

    // Test 3: Check user data from database
    if (user) {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase!.from("users").select("*").eq("id", user.id).single()

        results.push({
          name: "User Database Record",
          success: !!data && !error,
          message: data
            ? `User record found: ${JSON.stringify(data)}`
            : `User record not found: ${error?.message || "Unknown error"}`,
        })
      } catch (error) {
        results.push({
          name: "User Database Record",
          success: false,
          message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
    }

    setTestResults(results)
    setLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    setSessionStatus("unauthenticated")
    setTestResults([])
  }

  return (
    <>
      <Header />
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Test</CardTitle>
              <CardDescription>Test your Supabase authentication integration</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Authentication Status</h3>
                    {sessionStatus === "authenticated" ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertTitle className="text-green-700">Authenticated</AlertTitle>
                        <AlertDescription className="text-green-600">
                          <p>
                            <strong>User ID:</strong> {user?.id}
                          </p>
                          <p>
                            <strong>Email:</strong> {user?.email}
                          </p>
                          <p>
                            <strong>Name:</strong> {user?.name || "Not set"}
                          </p>
                          <p>
                            <strong>Role:</strong> {user?.role || "Not set"}
                          </p>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <AlertTitle className="text-amber-700">Not Authenticated</AlertTitle>
                        <AlertDescription className="text-amber-600">You are not currently logged in.</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={runAuthTests} disabled={loading}>
                      Run Authentication Tests
                    </Button>
                    {sessionStatus === "authenticated" && (
                      <Button variant="outline" onClick={handleLogout}>
                        Logout
                      </Button>
                    )}
                  </div>

                  {testResults.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Test Results</h3>
                      <div className="space-y-3">
                        {testResults.map((result, index) => (
                          <Alert
                            key={index}
                            className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}
                          >
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <AlertTitle className={result.success ? "text-green-700" : "text-red-700"}>
                              {result.name}
                            </AlertTitle>
                            <AlertDescription className={result.success ? "text-green-600" : "text-red-600"}>
                              {result.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
