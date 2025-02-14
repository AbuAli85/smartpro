"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface TestResult {
  name: string
  status: "running" | "passed" | "failed"
  error?: string
  details?: string[]
}

export default function RunAuthTests() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<TestResult[]>([])

  async function runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    setResults((prev) => [...prev, { name, status: "running" }])
    try {
      await testFn()
      return { name, status: "passed" }
    } catch (error) {
      return { name, status: "failed", error: error.message }
    }
  }

  async function runAllTests() {
    setIsRunning(true)
    setProgress(0)
    setResults([])

    const tests = [
      {
        name: "Registration Test",
        fn: async () => {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: `test${Date.now()}@example.com`,
              password: "TestPass123!",
              name: "Test User",
              role: "client",
            }),
          })
          if (!response.ok) throw new Error("Registration failed")
        },
      },
      {
        name: "Login Test",
        fn: async () => {
          const response = await fetch("/api/auth/callback/credentials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "test@example.com",
              password: "TestPass123!",
            }),
          })
          if (!response.ok) throw new Error("Login failed")
        },
      },
      {
        name: "Session Persistence",
        fn: async () => {
          const response = await fetch("/api/auth/session")
          if (!response.ok) throw new Error("Session check failed")
        },
      },
      {
        name: "Role-Based Access",
        fn: async () => {
          const response = await fetch("/dashboard/client")
          if (!response.ok) throw new Error("Role-based access check failed")
        },
      },
    ]

    for (let i = 0; i < tests.length; i++) {
      const result = await runTest(tests[i].name, tests[i].fn)
      setResults((prev) => [...prev.slice(0, -1), result])
      setProgress(((i + 1) / tests.length) * 100)
    }

    setIsRunning(false)
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Authentication System Test Runner</span>
            <Button onClick={runAllTests} disabled={isRunning}>
              {isRunning ? "Running Tests..." : "Start Tests"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isRunning && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Progress: {Math.round(progress)}%</div>
              <Progress value={progress} />
            </div>
          )}

          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border">
                <div className="mt-0.5">
                  {result.status === "running" && <AlertCircle className="h-5 w-5 text-blue-500 animate-pulse" />}
                  {result.status === "passed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {result.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{result.name}</p>
                  {result.status === "running" && <p className="text-sm text-muted-foreground">Test in progress...</p>}
                  {result.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!isRunning && results.length > 0 && (
            <div className="pt-4 border-t">
              <div className="text-sm font-medium">Summary:</div>
              <div className="text-sm text-muted-foreground">
                Total Tests: {results.length}
                <br />
                Passed: {results.filter((r) => r.status === "passed").length}
                <br />
                Failed: {results.filter((r) => r.status === "failed").length}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

