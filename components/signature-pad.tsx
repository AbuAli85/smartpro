"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Trash2, Download, Upload } from "lucide-react"
import { getTranslations } from "@/utils/translations"

interface SignaturePadProps {
  value: string
  onChange: (value: string) => void
  language: "en" | "ar"
  label: string
  required?: boolean
  error?: string
}

export default function SignaturePad({ value, onChange, language, label, required = false, error }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [mode, setMode] = useState<"draw" | "upload">("draw")
  const t = getTranslations(language)

  // Clear the signature pad
  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear()
      setIsEmpty(true)
      onChange("")
    }
  }

  // Save the signature as base64
  const save = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL("image/png")
      onChange(dataURL)
      setIsEmpty(false)
    }
  }

  // Handle window resize to adjust canvas
  useEffect(() => {
    const handleResize = () => {
      if (sigCanvas.current) {
        const canvas = sigCanvas.current.getCanvas()
        const ratio = Math.max(window.devicePixelRatio || 1, 1)
        canvas.width = canvas.offsetWidth * ratio
        canvas.height = canvas.offsetHeight * ratio
        canvas.getContext("2d")?.scale(ratio, ratio)
        sigCanvas.current.clear()

        // If we had a previous value, redraw it
        if (value && mode === "draw") {
          const img = new Image()
          img.onload = () => {
            canvas.getContext("2d")?.drawImage(img, 0, 0)
          }
          img.src = value
        }
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [value, mode])

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        onChange(base64)
        setIsEmpty(false)
      } catch (err) {
        console.error("Error converting file to base64:", err)
      }
    }
  }

  // Toggle between draw and upload modes
  const toggleMode = () => {
    setMode(mode === "draw" ? "upload" : "draw")
    clear()
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={toggleMode}
          className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          {mode === "draw" ? (
            <>
              <Upload className="h-3 w-3" /> {t.switchToUpload}
            </>
          ) : (
            <>
              <Download className="h-3 w-3" /> {t.switchToDraw}
            </>
          )}
        </button>
      </div>

      {mode === "draw" ? (
        <>
          <div
            className={`border-2 rounded-md ${error ? "border-red-500" : "border-gray-300"} bg-white overflow-hidden`}
          >
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: "signature-canvas",
                style: {
                  width: "100%",
                  height: "200px",
                },
              }}
              backgroundColor="white"
              onEnd={save}
            />
          </div>

          <div className="flex justify-between">
            <p className="text-xs text-gray-500">{t.signatureInstructions}</p>
            <button
              type="button"
              onClick={clear}
              className="text-xs flex items-center gap-1 text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-3 w-3" /> {t.clear}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full p-2 border rounded-md" />
          <p className="text-xs text-gray-500">{t.uploadInstructions}</p>
        </div>
      )}

      {value && (
        <div className="mt-2 border rounded p-2 max-w-[200px]">
          <p className="text-xs text-gray-500 mb-1">{t.preview}</p>
          <img src={value || "/placeholder.svg"} alt="Signature preview" className="max-h-[100px] object-contain" />
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}
