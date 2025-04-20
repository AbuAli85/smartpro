import type React from "react"
import { cn } from "@/lib/utils"

interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function TouchTarget({ children, className, ...props }: TouchTargetProps) {
  return (
    <div
      className={cn(
        "sm:p-0 p-2 -m-2", // Add padding on mobile, negative margin to maintain layout
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
