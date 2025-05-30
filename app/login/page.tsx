"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.replace("/dashboard")
      } else {
        setIsCheckingUser(false)
      }
    }
    checkUser()
  }, [supabase, router])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        // The error object from Supabase should contain the detailed message
        console.error("Supabase login error object:", error)
        toast({
          title: "Login Failed",
          description: error.message || "An unknown error occurred.",
          variant: "destructive",
        })
      } else {
        toast({ title: "Login Successful", description: "Redirecting to dashboard..." })
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Catch block error during login:", error)
      toast({
        title: "An unexpected error occurred",
        description: error.message || String(error),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // THIS IS THE CRUCIAL LOGGING PART:
  useEffect(() => {
    console.log("--- LOGIN PAGE ENV VAR CHECK (on component mount) ---")
    console.log("Value of process.env.NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Value of process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log("--- END LOGIN PAGE ENV VAR CHECK ---")
  }, []) // Empty dependency array means this runs once when the component mounts

  if (isCheckingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
