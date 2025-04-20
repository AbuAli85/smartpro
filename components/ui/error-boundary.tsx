"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { captureException } from "@/lib/sentry"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Error caught by error boundary:", error)
      setError(error.error)
      setHasError(true)

      // Log the error using our simplified tracking
      if (error.error instanceof Error) {
        captureException(error.error)
      }
    }

    window.addEventListener("error", errorHandler)
    return () => window.removeEventListener("error", errorHandler)
  }, [])

  if (hasError) {
    if (fallback) return <>{fallback}</>

    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-50 rounded-lg border border-gray-200 min-h-[200px]">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
        <p className="text-sm text-gray-500 mb-4">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setHasError(false)
            setError(null)
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
