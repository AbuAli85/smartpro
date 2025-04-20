"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"

interface SignaturePadProps {
  value: string
  onChange: (value: string) => void
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(!value)

  // Initialize canvas and load existing signature if available
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#000"

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Load existing signature if available
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        setIsEmpty(false)
      }
      img.src = value
    }
  }, [])

  // Handle drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e instanceof MouseEvent ? e.clientX - rect.left : e.touches[0].clientX - rect.left
    const y = e instanceof MouseEvent ? e.clientY - rect.top : e.touches[0].clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e instanceof MouseEvent ? e.clientX - rect.left : e.touches[0].clientX - rect.left
    const y = e instanceof MouseEvent ? e.clientY - rect.top : e.touches[0].clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
    setIsEmpty(false)
  }

  const endDrawing = () => {
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    // Save signature as data URL
    const dataURL = canvas.toDataURL("image/png")
    onChange(dataURL)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    onChange("")
  }

  return (
    <div className="space-y-2">
      <div className="border-2 rounded-md border-gray-300 bg-white overflow-hidden" style={{ touchAction: "none" }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full cursor-crosshair"
          style={{ height: "200px" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>

      <div className="flex justify-between">
        <p className="text-xs text-gray-500">Sign using your mouse or finger</p>
        <button
          type="button"
          onClick={clearSignature}
          className="text-xs flex items-center gap-1 text-red-600 hover:text-red-800"
        >
          Clear
        </button>
      </div>

      {value && (
        <div className="mt-2 border rounded p-2 max-w-[200px]">
          <p className="text-xs text-gray-500 mb-1">Preview</p>
          <img src={value || "/placeholder.svg"} alt="Signature preview" className="max-h-[100px] object-contain" />
        </div>
      )}
    </div>
  )
}
