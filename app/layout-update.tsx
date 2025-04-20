import SentryProvider from "./layout-sentry"

// Add this to your existing layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SentryProvider>
          {/* Your existing layout content */}
          {children}
        </SentryProvider>
      </body>
    </html>
  )
}
