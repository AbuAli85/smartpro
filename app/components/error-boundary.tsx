"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { clearAuthTokens } from "@/app/lib/auth-utils"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnChange?: any
  handleAuthErrors?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  isAuthError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isAuthError: false,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is an authentication error
    const isAuthError =
      error.message.includes("Authentication failed") ||
      error.message.includes("401") ||
      error.message.includes("Unauthorized")

    return {
      hasError: true,
      error,
      errorInfo: null,
      isAuthError,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    console.error("Error caught by ErrorBoundary:", error, errorInfo)

    // Update state with error details
    this.setState({
      errorInfo,
      isAuthError:
        error.message.includes("Authentication failed") ||
        error.message.includes("401") ||
        error.message.includes("Unauthorized"),
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Handle authentication errors
    if (
      this.props.handleAuthErrors &&
      (error.message.includes("Authentication failed") ||
        error.message.includes("401") ||
        error.message.includes("Unauthorized"))
    ) {
      // Clear auth tokens
      clearAuthTokens()

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset the error state if resetOnChange prop changes
    if (this.state.hasError && this.props.resetOnChange !== prevProps.resetOnChange) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isAuthError: false,
      })
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Handle auth errors specially if enabled
      if (this.props.handleAuthErrors && this.state.isAuthError) {
        return (
          <AuthErrorFallback
            error={this.state.error}
            resetError={() => {
              this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                isAuthError: false,
              })
            }}
          />
        )
      }

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={() => {
            this.setState({
              hasError: false,
              error: null,
              errorInfo: null,
              isAuthError: false,
            })
          }}
        />
      )
    }

    // Render children if no error
    return this.props.children
  }
}

// Default error fallback UI
function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error | null
  resetError: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-center text-gray-900">Something went wrong</h2>
        <p className="mb-4 text-sm text-center text-gray-600">We encountered an error while processing your request.</p>
        {error && (
          <div className="p-3 mb-4 overflow-auto text-sm bg-gray-100 rounded-md max-h-32">
            <code className="text-red-600">{error.message}</code>
          </div>
        )}
        <div className="flex flex-col space-y-2">
          <Button onClick={resetError} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="w-full">
            Go to home page
          </Button>
        </div>
      </div>
    </div>
  )
}

// Auth error specific fallback UI
function AuthErrorFallback({
  error,
  resetError,
}: {
  error: Error | null
  resetError: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-center text-gray-900">Authentication Error</h2>
        <p className="mb-4 text-sm text-center text-gray-600">
          Your session has expired or you don't have permission to access this resource.
        </p>
        <div className="flex flex-col space-y-2">
          <Button onClick={() => router.push("/login")} className="w-full">
            Sign in again
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="w-full">
            Go to home page
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
