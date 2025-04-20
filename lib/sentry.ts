"use client"

// Simple console-based error logging (no Sentry yet)
export function initSentry(): void {
  console.log("Error tracking initialized")
}

export function captureException(error: Error): void {
  console.error("Error captured:", error)
  // We'll add Sentry integration later once basic error handling works
}

export function captureMessage(message: string): void {
  console.log("Message captured:", message)
  // We'll add Sentry integration later once basic error handling works
}
