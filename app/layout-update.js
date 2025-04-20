import SentryProvider from "./sentry-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SentryProvider>{children}</SentryProvider>
      </body>
    </html>
  )
}
