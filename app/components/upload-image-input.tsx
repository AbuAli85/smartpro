"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, Upload, X, AlertCircle } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { edgeFunctions } from "@/app/lib/edge-function-client"
import { useAuth } from "@/app/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UploadImageInputProps {
  id: string
  label: string
  value: string
  onChange: (url: string) => void
  required?: boolean
  accept?: string
  maxSizeMB?: number
  bucketName?: string
  folderPath?: string
  placeholder?: string
}

export default function UploadImageInput({
  id,
  label,
  value,
  onChange,
  required = false,
  accept = "image/*",
  maxSizeMB = 5,
  bucketName = "contract-assets",
  folderPath = "uploads",
  placeholder = "en",
}: UploadImageInputProps) {
  const { authenticated } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)

    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const selectedFile = e.target.files[0]

    // Validate file size
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`)
      return
    }

    setFile(selectedFile)

    try {
      if (!authenticated) {
        setError("Authentication required to upload files")
        return
      }

      setIsUploading(true)

      // Use the Edge Function client to upload the file
      const result = await edgeFunctions.uploadFile(selectedFile, bucketName, folderPath)

      // Call onChange with the new URL
      onChange(result.fileUrl)
    } catch (err) {
      console.error("Error uploading file:", err)
      setError("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange("")
    setFile(null)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {!authenticated && (
        <Alert variant="warning" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>You need to be logged in to upload files.</AlertDescription>
        </Alert>
      )}

      {value ? (
        <div className="relative border rounded-md p-2">
          <div className="relative h-48 w-full">
            <Image src={value || "/placeholder.svg"} alt={label} fill className="object-contain" unoptimized />
          </div>
          <Button type="button" variant="outline" size="sm" className="absolute top-2 right-2" onClick={handleRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border border-dashed rounded-md p-6 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                {placeholder === "en" ? "Click or drag file to upload" : "انقر أو اسحب الملف للتحميل"}
              </p>
              <p className="text-xs text-gray-400">
                {accept.replace("*", "")} (Max: {maxSizeMB}MB)
              </p>
              <Input
                id={id}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                disabled={!authenticated}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => document.getElementById(id)?.click()}
                disabled={!authenticated}
              >
                {placeholder === "en" ? "Select File" : "اختر ملف"}
              </Button>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
