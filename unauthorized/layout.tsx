import type React from "react"
import { AuthProvider } from "@/components/providers/session-provider"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}

