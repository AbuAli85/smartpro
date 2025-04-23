import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { LanguageProvider } from "./contexts/language-context"
import { ReactQueryProvider } from "./lib/react-query-provider"
import { AuthProvider } from "./contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Bilingual Contract Generator",
  description: "Generate bilingual contracts with ease",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AuthProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
