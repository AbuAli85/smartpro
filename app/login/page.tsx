"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, AlertCircle, Info } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Header } from "../components/header"
import { loginWithEmailPassword } from "../lib/auth-utils"
import { DEV_MODE, MOCK_USERS } from "../lib/lovable-auth-config"

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDevHelp, setShowDevHelp] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Check if user just registered
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setRegistrationSuccess(true)
    }
  }, [searchParams])

  // Check if we're in development mode
  useEffect(() => {
    setShowDevHelp(DEV_MODE)
  }, [])

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      await loginWithEmailPassword(values.email, values.password)

      // Redirect to appropriate page based on user role
      // This will be handled by the middleware
      router.push("/")
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  // Fill form with test credentials
  const fillTestCredentials = (email: string, password: string) => {
    form.setValue("email", email)
    form.setValue("password", password)
  }

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login to Contract Generator</CardTitle>
            <CardDescription>Enter your credentials to access your contracts</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {registrationSuccess && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-700">Registration Successful</AlertTitle>
                <AlertDescription className="text-green-600">
                  Your account has been created. Please log in with your credentials.
                </AlertDescription>
              </Alert>
            )}

            {showDevHelp && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700">Development Mode</AlertTitle>
                <AlertDescription className="text-blue-600">
                  <p className="mb-2">Use one of these test accounts:</p>
                  <div className="space-y-1 text-xs">
                    {MOCK_USERS.map((user) => (
                      <div key={user.email} className="flex justify-between items-center">
                        <span>
                          <strong>{user.email}</strong> / {user.password} ({user.role})
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => fillTestCredentials(user.email, user.password)}
                        >
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <a href="/signup" className="text-primary hover:underline">
                Sign up
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
