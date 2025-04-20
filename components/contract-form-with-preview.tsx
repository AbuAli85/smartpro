"use client"

import { useState } from "react"
import { Button } from "./ui/simple-button"
import SignaturePad from "./signature-pad"

export default function ContractFormWithPreview() {
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    contractType: "",
    firstPartyName: "",
    secondPartyName: "",
    startDate: "",
    endDate: "",
    responsibilities: "",
    signature: "",
  })
  const [referenceNumber, setReferenceNumber] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignatureChange = (signatureData) => {
    setFormData((prev) => ({ ...prev, signature: signatureData }))
  }

  const generateReferenceNumber = () => {
    return `PRM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`
  }

  const handlePreview = () => {
    // Validate form
    if (
      !formData.contractType ||
      !formData.firstPartyName ||
      !formData.secondPartyName ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.responsibilities ||
      !formData.signature
    ) {
      alert("Please fill in all required fields")
      return
    }

    // Generate reference number if not already set
    if (!referenceNumber) {
      setReferenceNumber(generateReferenceNumber())
    }
    setShowPreview(true)
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const payload = {
        ...formData,
        referenceNumber: referenceNumber || generateReferenceNumber(),
        language: "en",
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert("Contract submitted successfully!")
      setFormData({
        contractType: "",
        firstPartyName: "",
        secondPartyName: "",
        startDate: "",
        endDate: "",
        responsibilities: "",
        signature: "",
      })
      setShowPreview(false)
      setReferenceNumber("")
    } catch (error) {
      console.error(error)
      alert("An error occurred. Please try again.")
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
          <select
            name="contractType"
            value={formData.contractType}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Contract Type</option>
            <option value="Assignment">Assignment</option>
            <option value="Hourly">Hourly</option>
            <option value="Fixed">Fixed Price</option>
            <option value="Retainer">Retainer</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">First Party Name</label>
          <input
            name="firstPartyName"
            value={formData.firstPartyName}
            onChange={handleInputChange}
            placeholder="Enter first party name"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Second Party Name</label>
          <input
            name="secondPartyName"
            value={formData.secondPartyName}
            onChange={handleInputChange}
            placeholder="Enter second party name"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Responsibilities</label>
          <textarea
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleInputChange}
            placeholder="Enter contract responsibilities and details"
            className="w-full p-2 border rounded-md min-h-[120px]"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Signature</label>
          <SignaturePad value={formData.signature} onChange={handleSignatureChange} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={handlePreview} variant="outline">
            Preview Contract
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Contract"}
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Contract Preview</h2>
              <button
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPreview(false)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Reference Number</h3>
                <p className="text-lg font-bold">{referenceNumber}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Contract Type</h3>
                <p className="text-base">{formData.contractType}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">First Party Name</h3>
                  <p className="text-base font-medium">{formData.firstPartyName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Second Party Name</h3>
                  <p className="text-base font-medium">{formData.secondPartyName}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                <p className="text-base">
                  {formData.startDate} to {formData.endDate}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Responsibilities</h3>
                <div className="mt-1 p-4 border rounded-md bg-gray-50">
                  <p className="text-base whitespace-pre-wrap">{formData.responsibilities}</p>
                </div>
              </div>

              {formData.signature && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Signature</h3>
                  <div className="mt-1 border rounded-md p-2 bg-white">
                    <img
                      src={formData.signature || "/placeholder.svg"}
                      alt="Signature"
                      className="max-h-24 object-contain mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t sticky bottom-0 bg-white flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Back to Edit
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit Contract"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
