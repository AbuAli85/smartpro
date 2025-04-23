"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Header } from "../components/header"
import { useAuth } from "../contexts/auth-context"

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function LoginPage() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      await login(values.email, values.password)
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login to Contract Generator</CardTitle>
            <CardDescription>Enter your lovable.dev credentials to access your contracts</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
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
              <a
                href="https://lovable.dev/signup"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign up at lovable.dev
              </a>
            </p>
            <p className="text-xs text-muted-foreground text-center">
              This application uses lovable.dev for backend services. Your login credentials are securely transmitted to
              lovable.dev.
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
