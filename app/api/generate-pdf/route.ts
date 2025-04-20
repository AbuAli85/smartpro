import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { contractService } from "@/services/contract-service"
import { storageService } from "@/services/storage-service"
import { generateContractPDF } from "@/utils/pdf-generator"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = getSupabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get request body
    const body = await request.json()
    const { contractId } = body

    if (!contractId) {
      return NextResponse.json({ error: "Contract ID is required" }, { status: 400 })
    }

    // Get contract data
    const contract = await contractService.getContractById(contractId)

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    // Check if user has permission - safely access user ID
    const userId = session?.user?.id || ""
    if (!userId || contract.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Generate PDF
    const pdfBlob = await generateContractPDF(
      {
        contractType: contract.contract_type,
        firstPartyName: contract.first_party_name,
        secondPartyName: contract.second_party_name,
        startDate: contract.start_date,
        endDate: contract.end_date,
        responsibilities: contract.responsibilities,
        signature: contract.signature,
        stamp: contract.stamp || undefined,
        referenceNumber: contract.reference_number,
      },
      contract.language as "en" | "ar",
    )

    // Upload PDF to Supabase Storage
    const pdfUrl = await storageService.uploadPdf(userId, pdfBlob)

    // Update contract with PDF URL
    await contractService.updateContractWithPdf(contractId, pdfUrl)

    return NextResponse.json({ success: true, pdfUrl })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
