"use client"

import { useEffect } from "react"
import { initSentry } from "@/lib/sentry"
import type { ReactNode } from "react"

export default function SentryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initSentry()
  }, [])

  return <>{children}</>
}
