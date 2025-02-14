"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"

export default function VerifyPage() {
  const [isVerifying, setIsVerifying] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyToken = async () => {
      // Implement your token verification logic here
      // For demonstration purposes, we'll use a timeout
      setTimeout(() => {
        setIsVerifying(false)
        toast.success("Email verified successfully!")
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }, 2000)
    }

    verifyToken()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Toaster />
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        {isVerifying ? (
          <p className="text-gray-600">Verifying your email...</p>
        ) : (
          <p className="text-green-600">Email verified successfully!</p>
        )}
      </div>
    </div>
  )
}

