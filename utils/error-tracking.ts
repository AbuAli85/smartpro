import * as Sentry from "@sentry/nextjs"

// Set user information for better error context
export const identifyUser = (user: { id: string; email: string; role?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role || "user",
  })
}

// Clear user information (e.g., on logout)
export const clearUserIdentity = () => {
  Sentry.setUser(null)
}

// Manually capture an error with additional context
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }
    return Sentry.captureException(error)
  })
}

// Set a breadcrumb to track user actions
export const addBreadcrumb = (message: string, category = "user-action", level: Sentry.SeverityLevel = "info") => {
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
    transaction.setStatus("internal_error")
    throw error
  } finally {
    transaction.finish()
  }
}
