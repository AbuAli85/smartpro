"use client"

import { useEffect } from "react"
import { initSentry } from "@/lib/sentry"

export default function SentryProvider({ children }) {
  useEffect(() => {
    initSentry()
  }, [])

  return <>{children}</>
}
