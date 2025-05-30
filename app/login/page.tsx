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
        toast({ title: "Login Failed", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "Login Successful", description: "Redirecting to dashboard..." })
        router.push("/dashboard") // Or router.refresh() if middleware handles redirect
      }
    } catch (error) {
      toast({ title: "An unexpected error occurred", description: String(error), variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Optionally, add a link to a sign-up page or OAuth providers
  // const handleOAuthLogin = async (provider: 'google' | 'github') => {
  //   setIsLoading(true);
  //   await supabase.auth.signInWithOAuth({ provider });
  //   setIsLoading(false);
  // };

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
            {/* Example OAuth
            <Button variant="outline" className="w-full" onClick={() => handleOAuthLogin('google')} disabled={isLoading}>
              Sign in with Google
            </Button> */}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
