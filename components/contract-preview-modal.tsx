"use client"
import { useState } from "react"
import { format } from "date-fns"
import { Download, Loader2 } from "lucide-react"
import { getTranslations } from "@/utils/translations"
import { generateContractPDF, downloadPDF } from "@/utils/pdf-generator"

type ContractData = {
  contractType: string
  firstPartyName: string
  secondPartyName: string
  startDate: string
  endDate: string
  responsibilities: string
  signature: string
  stamp?: string
  referenceNumber: string
}

interface ContractPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  data: ContractData
  isSubmitting: boolean
  language: "en" | "ar"
}

export default function ContractPreviewModal({
  isOpen,
  onClose,
  onSubmit,
  data,
  isSubmitting,
  language,
}: ContractPreviewModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  if (!isOpen) return null

  // Get translations based on selected language
  const t = getTranslations(language)

  // Format dates for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (e) {
      return dateString
    }
  }

  // Handle PDF download
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const pdfBlob = await generateContractPDF(data, language)
      const filename = `contract-${data.referenceNumber}.pdf`
      downloadPDF(pdfBlob, filename)
    } catch (error) {
      console.error("Error generating PDF:", error)
      // Show an error message to the user
      alert(
        language === "ar"
          ? "حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى."
          : "An error occurred while generating the PDF. Please try again.",
      )
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className={`bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${language === "ar" ? "rtl" : "ltr"}`}
      >
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold">{t.previewTitle}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="text-blue-600 hover:text-blue-800 focus:outline-none flex items-center gap-1"
              aria-label="Download PDF"
            >
              {isGeneratingPDF ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              <span className="hidden sm:inline">
                {isGeneratingPDF ? t.generating || "Generating..." : t.downloadPDF || "Download PDF"}
              </span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Reference Number */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">{t.referenceNumber}</h3>
            <p className="text-lg font-bold">{data.referenceNumber}</p>
          </div>

          {/* Contract Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">{t.contractType}</h3>
            <p className="text-base">
              {t.contractTypeOptions[data.contractType.toLowerCase() as keyof typeof t.contractTypeOptions] ||
                data.contractType}
            </p>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t.firstPartyName}</h3>
              <p className="text-base font-medium">{data.firstPartyName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t.secondPartyName}</h3>
              <p className="text-base font-medium">{data.secondPartyName}</p>
            </div>
          </div>

          {/* Duration */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">{t.duration}</h3>
            <p className="text-base">
              {formatDate(data.startDate)} {t.to} {formatDate(data.endDate)}
            </p>
          </div>

          {/* Responsibilities */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">{t.responsibilities}</h3>
            <div className="mt-1 p-4 border rounded-md bg-gray-50">
              <p className="text-base whitespace-pre-wrap">{data.responsibilities}</p>
            </div>
          </div>

          {/* Signature & Stamp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.signature && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.signature}</h3>
                <div className="mt-1 border rounded-md p-2 bg-white">
                  <img
                    src={data.signature || "/placeholder.svg"}
                    alt="Signature"
                    className="max-h-24 object-contain mx-auto"
                  />
                </div>
              </div>
            )}

            {data.stamp && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.stamp}</h3>
                <div className="mt-1 border rounded-md p-2 bg-white">
                  <img src={data.stamp || "/placeholder.svg"} alt="Stamp" className="max-h-24 object-contain mx-auto" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-6 border-t sticky bottom-0 bg-white flex justify-end gap-3 ${language === "ar" ? "flex-row-reverse" : ""}`}
        >
          <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
            {t.backToEdit}
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t.submitting : t.submitContract}
          </button>
        </div>
      </div>
    </div>
  )
}
