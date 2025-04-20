"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log the error to console
    console.error("Error caught by boundary:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="mb-6 text-red-500">
        <AlertTriangle size={48} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6 max-w-md">We've been notified about this issue and are working to fix it.</p>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </div>
  )
}
