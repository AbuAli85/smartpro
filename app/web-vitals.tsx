"use client"

import { useReportWebVitals } from "next/web-vitals"
import * as Sentry from "@sentry/nextjs"

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // This function is called when the browser calculates a web vital metric

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(metric)
    }

    // Send to Sentry as well for correlation with errors
    Sentry.metrics.mark(`web-vital.${metric.name}`, {
      value: metric.value,
      tags: {
        page: window.location.pathname,
      },
    })
  })

  return null
}
