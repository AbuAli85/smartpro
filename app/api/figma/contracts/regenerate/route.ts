import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient } from "@/lib/supabase-client"
import { headers } from "next/headers"
import { generateFigmaContractJSON } from "@/app/lib/figma-contract-generator"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get API key from request headers for authentication
    const headersList = headers()
    const apiKey = headersList.get("x-api-key")

    // Basic API key validation
    const validApiKey = process.env.FIGMA_PLUGIN_API_KEY || ""

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid API key" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()
    const { contractId } = body

    if (!contractId) {
      return NextResponse.json({ success: false, error: "Contract ID is required" }, { status: 400 })
    }

    // Get the Supabase client
    const supabase = getServerSupabaseClient()

    // Fetch the contract data
    const { data: contract, error: fetchError } = await supabase
      .from("promoter_contracts")
      .select("*")
      .eq("id", contractId)
      .single()

    if (fetchError) {
      console.error("Error fetching contract:", fetchError)
      return NextResponse.json({ success: false, error: "Failed to fetch contract" }, { status: 500 })
    }

    if (!contract) {
      return NextResponse.json({ success: false, error: "Contract not found" }, { status: 404 })
    }

    // Extract contract data from various possible locations
    const contractData = contract.contract_data || {}
    const metadata = contract.contract_layout?.metadata || {}

    // Generate Figma-friendly JSON
    const figmaJSON = generateFigmaContractJSON({
      firstPartyName: contractData.first_party_name_en || metadata.first_party_name?.en || "",
      firstPartyNameAr: contractData.first_party_name_ar || metadata.first_party_name?.ar || "",
      firstPartyAddress: contractData.first_party_cr || "",
      firstPartyAddressAr: contractData.first_party_cr || "",
      secondPartyName: contractData.second_party_name_en || metadata.second_party_name?.en || "",
      secondPartyNameAr: contractData.second_party_name_ar || metadata.second_party_name?.ar || "",
      secondPartyAddress: contractData.second_party_cr || "",
      secondPartyAddressAr: contractData.second_party_cr || "",
      promoterName: contractData.promoter_name_en || metadata.promoter_name?.en || "",
      promoterNameAr: contractData.promoter_name_ar || metadata.promoter_name?.ar || "",
      productName: contractData.product_name_en || metadata.product_name?.en || "",
      productNameAr: contractData.product_name_ar || metadata.product_name?.ar || "",
      location: contractData.location_name_en || metadata.location_name?.en || "",
      locationAr: contractData.location_name_ar || metadata.location_name?.ar || "",
      startDate: new Date(contractData.start_date || metadata.start_date || new Date()),
      endDate: new Date(contractData.end_date || metadata.end_date || new Date()),
      templateId: "promoterAssignment", // Default template
    })

    // Update the contract with the new json_layout
    const { error: updateError } = await supabase
      .from("promoter_contracts")
      .update({
        json_layout: figmaJSON,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contractId)

    if (updateError) {
      console.error("Error updating contract:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update contract with JSON layout" }, { status: 500 })
    }

    // Return the generated JSON
    return NextResponse.json({
      success: true,
      data: {
        id: contract.id,
        created_at: contract.created_at,
        layout: figmaJSON,
      },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
