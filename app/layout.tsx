import "./globals.css"
import type { ReactNode } from "react"

export const metadata = {
  title: "Bilingual Contract Generator",
  description: "Generate bilingual contracts easily",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  )
}
