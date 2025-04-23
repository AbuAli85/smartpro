import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient } from "@/lib/supabase-client"
import { headers } from "next/headers"

// Define the response type for clarity
interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get the contract ID from the URL parameters
    const contractId = params.id

    if (!contractId) {
      return NextResponse.json({ success: false, error: "Contract ID is required" }, { status: 400 })
    }

    // Get API key from request headers for authentication
    const headersList = headers()
    const apiKey = headersList.get("x-api-key")

    // Basic API key validation - in production, use a more secure method
    // This is a simple check to demonstrate the concept
    const validApiKey = process.env.FIGMA_PLUGIN_API_KEY || ""

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid API key" }, { status: 401 })
    }

    // Get the Supabase client
    const supabase = getServerSupabaseClient()

    // Fetch the contract data, specifically the json_layout field
    const { data, error } = await supabase
      .from("promoter_contracts")
      .select("id, created_at, json_layout")
      .eq("id", contractId)
      .single()

    if (error) {
      console.error("Error fetching contract:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch contract" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "Contract not found" }, { status: 404 })
    }

    // Check if json_layout exists
    if (!data.json_layout) {
      // If json_layout doesn't exist, we need to generate it
      // For now, return an error
      return NextResponse.json(
        {
          success: false,
          error:
            "Contract JSON layout not available for this contract. This contract may have been created before the Figma integration was implemented.",
        },
        { status: 404 },
      )
    }

    // Return the contract JSON layout
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        created_at: data.created_at,
        layout: data.json_layout,
      },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
