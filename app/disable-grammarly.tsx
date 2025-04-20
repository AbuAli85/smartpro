"use client"

import * as React from "react"

export function DisableGrammarly() {
  React.useEffect(() => {
    document.body.setAttribute("data-gramm", "false")
    return () => {
      document.body.removeAttribute("data-gramm")
    }
  }, [])

  return null
}
