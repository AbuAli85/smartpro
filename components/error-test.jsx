"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorTest() {
  const [count, setCount] = useState(0)

  const triggerClientError = () => {
    try {
      // Intentionally cause an error
      throw new Error("Test client-side error")
    } catch (error) {
      console.error(error)
      alert("Error caught: " + error.message)
    }
  }

  const causeRenderError = () => {
    setCount((c) => {
      if (c > 2) {
        // This will cause a render error
        throw new Error("Render error after count > 2")
      }
      return c + 1
    })
  }

  return (
    <div className="p-6 border rounded-lg space-y-4 max-w-md mx-auto my-8">
      <h2 className="text-xl font-bold">Error Testing Panel</h2>
      <p className="text-sm text-gray-600">Use these buttons to test error handling.</p>
      <div className="flex flex-col gap-2">
        <Button onClick={triggerClientError} variant="outline">
          Trigger Caught Error
        </Button>
        <Button onClick={causeRenderError} variant="destructive">
          Cause Render Error (Count: {count})
        </Button>
        <p className="text-xs text-gray-500">The render error will trigger after clicking 3 times</p>
      </div>
    </div>
  )
}
