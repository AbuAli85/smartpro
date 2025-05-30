"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.replace("/dashboard") // Redirect if already logged in
      } else {
        setIsCheckingUser(false)
      }
    }
    checkUser()
  }, [supabase, router])

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      // Optionally, you can pass additional user metadata here
      // const { data, error } = await supabase.auth.signUp({
      //   email,
      //   password,
      //   options: {
      //     data: {
      //       full_name: 'Optional Full Name', // if you add a field for this
      //     }
      //   }
      // });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" })
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        // This condition might indicate that the user already exists but is unconfirmed or has some other issue.
        // Supabase signUp might return a user object even if "User already registered" if "Confirm email" is off.
        // Or if "Confirm email" is on, and user exists but is unconfirmed, it might resend confirmation.
        // It's better to rely on specific error messages or check if data.session is null when confirmation is required.
        toast({
          title: "Sign Up Issue",
          description:
            "This email may already be registered or there was an issue. Please try logging in or resetting your password.",
          variant: "warning",
        })
      } else if (data.user && !data.session) {
        // This case typically means "Confirm email" is ON, and Supabase sent a confirmation email.
        toast({
          title: "Sign Up Successful! Please Confirm Your Email",
          description:
            "We've sent a confirmation link to your email address. Please check your inbox (and spam folder).",
          duration: 10000, // Longer duration for this important message
        })
        router.push("/login") // Redirect to login, they can't use app until confirmed
      } else if (data.user && data.session) {
        // This case means "Confirm email" is OFF, or it's a social sign-up (not applicable here).
        // User is signed up and logged in.
        toast({ title: "Sign Up Successful!", description: "Redirecting to dashboard..." })
        router.push("/dashboard")
      } else {
        // Fallback for unexpected response
        toast({
          title: "Sign Up Attempted",
          description: "Please check your email or try logging in.",
          variant: "default",
        })
      }
    } catch (error: any) {
      toast({
        title: "An unexpected error occurred",
        description: error.message || String(error),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your email and password to sign up.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
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
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                minLength={6} // Supabase default minimum password length
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Signing Up..." : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline hover:text-primary">
                Log In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
