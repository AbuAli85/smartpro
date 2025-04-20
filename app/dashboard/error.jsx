"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function DashboardError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="mb-6 text-yellow-500">
        <AlertTriangle size={48} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Dashboard Error</h2>
      <p className="text-gray-600 mb-6 max-w-md">There was a problem loading the dashboard.</p>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </div>
  )
}
