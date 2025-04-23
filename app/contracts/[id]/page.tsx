"use client"

import { useState } from "react"

import { useParams } from "next/navigation"
import { Download, Loader2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import ContractRenderer from "@/app/components/contract-renderer"
import html2pdf from "html2pdf.js"
import { Header } from "../../components/header"
import { useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { contractApi } from "@/app/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"

export default function ContractPage() {
  const params = useParams()
  const contractId = params?.id as string
  const contractRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Use React Query to fetch contract data
  const {
    data: contractJson,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: () => contractApi.getContract(contractId),
    enabled: !!contractId,
  })

  // Function to download the contract as PDF
  const downloadPdf = async () => {
    if (!contractRef.current) return

    try {
      setIsGeneratingPdf(true)

      // Clone the contract element to modify it for PDF
      const element = contractRef.current.cloneNode(true) as HTMLElement

      // Remove the print buttons
      const printButtons = element.querySelectorAll(".no-print")
      printButtons.forEach((button) => button.remove())

      // Configure html2pdf options
      const opt = {
        margin: 10,
        filename: `contract-${contractId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      // Generate PDF
      await html2pdf().from(element).set(opt).save()
    } catch (err) {
      console.error("Error generating PDF:", err)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-end mb-6 space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error loading contract</p>
            <p className="text-sm">{(error as Error)?.message || "The requested contract could not be found."}</p>
          </div>
        </div>
      </>
    )
  }

  if (!contractJson) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p className="font-medium">Contract not found</p>
            <p className="text-sm">The requested contract could not be found.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="py-8">
        <div className="max-w-4xl mx-auto mb-6 flex justify-end space-x-4 no-print">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={downloadPdf} disabled={isGeneratingPdf}>
            {isGeneratingPdf ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        <div ref={contractRef}>
          <ContractRenderer contractJson={contractJson} />
        </div>
      </div>
    </>
  )
}
