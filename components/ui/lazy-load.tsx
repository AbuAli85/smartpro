"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface LazyLoadProps {
  children: React.ReactNode
  placeholder?: React.ReactNode
  height?: number
  threshold?: number
  rootMargin?: string
}

export function LazyLoad({ children, placeholder, height = 200, threshold = 0.1, rootMargin = "0px" }: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      },
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin])

  return (
    <div ref={ref} style={{ minHeight: isVisible ? "auto" : height }}>
      {isVisible ? children : placeholder || <div className="animate-pulse bg-gray-200 rounded-md h-full w-full" />}
    </div>
  )
}
