"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "react-toastify"
import ContractPreviewModal from "./contract-preview-modal"

// You can import this from your schema file
const contractSchema = z.object({
  contractType: z.string().nonempty("Required"),
  firstPartyName: z.string().nonempty("Required"),
  secondPartyName: z.string().nonempty("Required"),
  startDate: z.string().nonempty("Start date required"),
  endDate: z.string().nonempty("End date required"),
  responsibilities: z.string().nonempty("Please enter responsibilities"),
  signature: z.string().nonempty("Signature required"),
  stamp: z.string().optional(),
})

type FormData = z.infer<typeof contractSchema>

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

export default function ContractFormWithPreview() {
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState("")
  const [signaturePreview, setSignaturePreview] = useState("")
  const [stampPreview, setStampPreview] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid },
    reset,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(contractSchema),
    mode: "onChange",
  })

  const generateReferenceNumber = () => {
    return `PRM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`
  }

  const handlePreview = async () => {
    // Validate form before showing preview
    const isFormValid = await trigger()
    if (isFormValid) {
      // Generate reference number if not already set
      if (!referenceNumber) {
        setReferenceNumber(generateReferenceNumber())
      }
      setShowPreview(true)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const payload = {
        ...data,
        referenceNumber: referenceNumber || generateReferenceNumber(),
        language: "en",
      }

      const res = await fetch("https://your-lovable.dev/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success("Contract submitted successfully!")
        reset()
        setShowPreview(false)
        setSignaturePreview("")
        setStampPreview("")
        setReferenceNumber("")
      } else {
        toast.error("Submission failed. Try again.")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form className="max-w-xl mx-auto p-6 space-y-4">
        <h2 className="text-xl font-bold">Create Contract</h2>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Contract Type</label>
          <select {...register("contractType")} className="w-full p-2 border rounded-md">
            <option value="">Select Contract Type</option>
            <option value="Assignment">Assignment</option>
            <option value="Hourly">Hourly</option>
            <option value="Fixed">Fixed Price</option>
            <option value="Retainer">Retainer</option>
          </select>
          {errors.contractType && <p className="text-red-500 text-sm">{errors.contractType.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">First Party Name</label>
          <input
            placeholder="Enter first party name"
            {...register("firstPartyName")}
            className="w-full p-2 border rounded-md"
          />
          {errors.firstPartyName && <p className="text-red-500 text-sm">{errors.firstPartyName.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Second Party Name</label>
          <input
            placeholder="Enter second party name"
            {...register("secondPartyName")}
            className="w-full p-2 border rounded-md"
          />
          {errors.secondPartyName && <p className="text-red-500 text-sm">{errors.secondPartyName.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Start Date</label>
            <input type="date" {...register("startDate")} className="w-full p-2 border rounded-md" />
            {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">End Date</label>
            <input type="date" {...register("endDate")} className="w-full p-2 border rounded-md" />
            {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Responsibilities</label>
          <textarea
            placeholder="Enter contract responsibilities and details"
            {...register("responsibilities")}
            className="w-full p-2 border rounded-md min-h-[120px]"
          />
          {errors.responsibilities && <p className="text-red-500 text-sm">{errors.responsibilities.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Signature</label>
          <input
            type="file"
            accept="image/*"
            className="w-full p-2 border rounded-md"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                const base64 = await fileToBase64(file)
                setValue("signature", base64)
                setSignaturePreview(base64)
                trigger("signature")
              }
            }}
          />
          {errors.signature && <p className="text-red-500 text-sm">{errors.signature.message}</p>}
          {signaturePreview && (
            <div className="mt-2 border rounded p-2 max-w-[200px]">
              <img
                src={signaturePreview || "/placeholder.svg"}
                alt="Signature preview"
                className="max-h-[100px] object-contain"
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Stamp (Optional)</label>
          <input
            type="file"
            accept="image/*"
            className="w-full p-2 border rounded-md"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                const base64 = await fileToBase64(file)
                setValue("stamp", base64)
                setStampPreview(base64)
              }
            }}
          />
          {stampPreview && (
            <div className="mt-2 border rounded p-2 max-w-[200px]">
              <img
                src={stampPreview || "/placeholder.svg"}
                alt="Stamp preview"
                className="max-h-[100px] object-contain"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={handlePreview} className="px-4 py-2 border rounded-md hover:bg-gray-50">
            Preview Contract
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Contract"}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      <ContractPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={loading}
        data={{
          ...getValues(),
          referenceNumber,
        }}
      />
    </>
  )
}
