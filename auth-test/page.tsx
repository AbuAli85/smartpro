"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    const results = []

    try {
      // Test 1: Register new user
      const testUser = {
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        password: "testpassword123",
        role: "CLIENT",
      }

      const registerResponse = await fetch("/api/auth/test/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      })

      const registerData = await registerResponse.json()
      results.push({
        test: "Registration",
        success: registerData.success,
        details: registerData.success ? "User created successfully" : registerData.message,
      })

      if (registerData.success) {
        // Test 2: Login with new user
        const loginResponse = await fetch("/api/auth/test/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password,
          }),
        })

        const loginData = await loginResponse.json()
        results.push({
          test: "Login",
          success: loginData.success,
          details: loginData.success ? "Login successful" : loginData.message,
        })

        // Test 3: Verify session
        const sessionResponse = await fetch("/api/auth/session")
        const sessionData = await sessionResponse.json()
        results.push({
          test: "Session",
          success: !!sessionData?.user,
          details: sessionData?.user ? "Session verified" : "No session found",
        })
      }
    } catch (error) {
      console.error("Test error:", error)
      results.push({
        test: "Error",
        success: false,
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
      setTestResults(results)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test Suite</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} disabled={isLoading}>
            {isLoading ? "Running Tests..." : "Run Authentication Tests"}
          </Button>

          {testResults.length > 0 && (
            <div className="mt-4 space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  <h3 className="font-bold">{result.test}</h3>
                  <p>{result.details}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

