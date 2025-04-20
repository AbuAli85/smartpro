"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { getTranslations } from "@/utils/translations"

interface RegisterFormProps {
  language: "en" | "ar"
}

export default function RegisterForm({ language }: RegisterFormProps) {
  const t = getTranslations(language)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch || "Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error, data } = await signUp(email, password)

      if (error) {
        setError(error.message)
      } else {
        setSuccess(t.registrationSuccess || "Registration successful! Please check your email to confirm your account.")
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t.register || "Register"}</CardTitle>
        <CardDescription>{t.registerDescription || "Create a new account"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPassword || "Confirm Password"}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button type="submit" className="w-full" disabled={isLoading} onClick={handleSubmit}>
          {isLoading ? t.submitting : t.register || "Register"}
        </Button>
        <p className="text-center text-sm">
          {t.alreadyHaveAccount || "Already have an account?"}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t.login}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
