"use client"

import { useEffect } from "react"
import { initSentry } from "@/lib/sentry"

export default function SentryProvider({ children }) {
  useEffect(() => {
    // Initialize our simplified error tracking
    initSentry()
  }, [])

  return <>{children}</>
}
