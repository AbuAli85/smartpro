"use client"

// Simple console-based error logging (no Sentry yet)
export function initSentry() {
  console.log("Error tracking initialized")
}

export function captureException(error) {
  console.error("Error captured:", error)
  // We'll add Sentry integration later once basic error handling works
}

export function captureMessage(message) {
  console.log("Message captured:", message)
  // We'll add Sentry integration later once basic error handling works
}
