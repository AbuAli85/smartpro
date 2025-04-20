import * as Sentry from "@sentry/nextjs"

// Set user information for better error context
export function identifyUser(user: { id: string; email: string; role?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role || "user",
  })
}

// Clear user information (e.g., on logout)
export function clearUserIdentity(): void {
  Sentry.setUser(null)
}

// Manually capture an error with additional context
export function captureError(error: Error, context?: Record<string, any>): string {
  return Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }
    return Sentry.captureException(error)
  })
}

// Set a breadcrumb to track user actions
export function addBreadcrumb(message: string, category = "user-action", level: Sentry.SeverityLevel = "info"): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
  })
}

// Track performance for specific operations
export async function trackPerformance<T>(
  name: string,
  operation: () => Promise<T>,
  options?: { tags?: Record<string, string> },
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name,
    op: "function",
    tags: options?.tags,
  })

  try {
    const result = await operation()
    transaction.setStatus("ok")
    return result
  } catch (error: any) {
    Sentry.captureException(error)
    transaction.setStatus("internal_error")
    throw error
  } finally {
    transaction.finish()
  }
}
