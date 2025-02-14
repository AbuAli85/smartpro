"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ErrorPage() {
  const router = useRouter()

  useEffect(() => {
    // Log the error to your error tracking service
    console.error("An authentication error occurred")
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>We encountered an issue while trying to authenticate you.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This could be due to an expired session, invalid credentials, or a temporary server issue. Please try
            signing in again.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

