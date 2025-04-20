"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, ArrowLeft, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTranslations } from "@/utils/translations"
import { format } from "date-fns"
import type { Contract } from "@/services/contract-service"

interface ContractDetailsProps {
  contract: Contract
}

export default function ContractDetails({ contract }: ContractDetailsProps) {
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "ar">(contract.language as "en" | "ar")
  const t = getTranslations(language)

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (e) {
      return dateString
    }
  }

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (contract.pdf_url) {
      window.open(contract.pdf_url, "_blank")
    }
  }

  // Handle print
  const handlePrint = () => {
    if (contract.pdf_url) {
      const printWindow = window.open(contract.pdf_url, "_blank")
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print()
        })
      }
    }
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${language === "ar" ? "rtl" : "ltr"}`}>
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>{t.back}</span>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span>{t.print}</span>
          </Button>

          <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>{t.downloadPDF}</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <div className="flex justify-between items-center">
            <CardTitle>{t.contractDetails}</CardTitle>
            <div className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {contract.reference_number}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.contractType}</h3>
                <p className="font-medium">
                  {t.contractTypeOptions[contract.contract_type.toLowerCase() as keyof typeof t.contractTypeOptions] ||
                    contract.contract_type}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.firstPartyName}</h3>
                <p className="font-medium">{contract.first_party_name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.secondPartyName}</h3>
                <p className="font-medium">{contract.second_party_name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.duration}</h3>
                <p className="font-medium">
                  {formatDate(contract.start_date)} {t.to} {formatDate(contract.end_date)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.createdAt}</h3>
                <p className="font-medium">{formatDate(contract.created_at)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.status}</h3>
                <p className="font-medium capitalize">{contract.status}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t.responsibilities}</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="whitespace-pre-wrap">{contract.responsibilities}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t.signature}</h3>
              <div className="border rounded-md p-3 bg-white">
                <img
                  src={contract.signature || "/placeholder.svg"}
                  alt="Signature"
                  className="max-h-24 object-contain mx-auto"
                />
              </div>
            </div>

            {contract.stamp && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t.stamp}</h3>
                <div className="border rounded-md p-3 bg-white">
                  <img
                    src={contract.stamp || "/placeholder.svg"}
                    alt="Stamp"
                    className="max-h-24 object-contain mx-auto"
                  />
                </div>
              </div>
            )}
          </div>

          {contract.pdf_url && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t.preview}</h3>
              <div className="border rounded-md overflow-hidden h-[500px]">
                <iframe src={contract.pdf_url} className="w-full h-full" title="Contract PDF"></iframe>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
