"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { captureError, addBreadcrumb } from "@/utils/error-tracking"
import * as Sentry from "@sentry/nextjs"

export default function TestErrorTracking() {
  const [showTest, setShowTest] = useState(false)

  const triggerError = () => {
    try {
      // Add a breadcrumb for context
      addBreadcrumb("User clicked 'Trigger Error' button", "ui.click")

      // Simulate an error
      throw new Error("This is a test error for Sentry")
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, { source: "test-component", action: "manual-trigger" })
      }
    }
  }

  const triggerUnhandledError = () => {
    // This will be caught by the error boundary
    throw new Error("This is an unhandled test error")
  }

  const triggerPerformanceIssue = () => {
    // Add a breadcrumb
    addBreadcrumb("User clicked 'Trigger Performance Issue' button", "ui.click")

    // Start a transaction
    const transaction = Sentry.startTransaction({
      name: "slow-operation",
      op: "test",
    })

    // Set the transaction as the current scope
    Sentry.configureScope((scope) => {
      scope.setSpan(transaction)
    })

    // Simulate a slow operation
    const start = Date.now()
    const duration = 2000 // Duration in milliseconds
    while (Date.now() - start < duration) {
      // Busy wait for 2 seconds
    }

    // Finish the transaction
    transaction.finish()
  }

  if (!showTest) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setShowTest(true)} className="bg-white shadow-md">
          Test Error Tracking
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Test Error Tracking</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowTest(false)}>
          Close
        </Button>
      </div>

      <div className="space-y-2">
        <Button variant="outline" size="sm" onClick={triggerError} className="w-full justify-start">
          Trigger Handled Error
        </Button>

        <Button variant="outline" size="sm" onClick={triggerUnhandledError} className="w-full justify-start">
          Trigger Unhandled Error
        </Button>

        <Button variant="outline" size="sm" onClick={triggerPerformanceIssue} className="w-full justify-start">
          Trigger Performance Issue
        </Button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        These buttons simulate errors and performance issues to test Sentry integration.
      </p>
    </div>
  )
}
