import type React from "react"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "@/components/layout/navigation"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { UserProvider } from "@/contexts/user-context"
import I18nQaChecker from "@/components/i18n-qa-checker"
import { SentryErrorBoundary } from "@/components/ui/sentry-error-boundary"
import { WebVitalsReporter } from "./web-vitals"
import TestErrorTracking from "@/components/test-error-tracking"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <html lang="en">
      <body>
        <SentryErrorBoundary>
          <AuthProvider>
            <UserProvider>
              <NotificationProvider>
                <Navigation />
                <main className="min-h-[calc(100vh-4rem)]">{children}</main>
                <Toaster />
                {isDevelopment && (
                  <>
                    <I18nQaChecker />
                    <TestErrorTracking />
                  </>
                )}
                <WebVitalsReporter />
              </NotificationProvider>
            </UserProvider>
          </AuthProvider>
        </SentryErrorBoundary>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
