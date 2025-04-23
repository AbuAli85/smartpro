import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient } from "@/lib/supabase-client"
import { headers } from "next/headers"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get API key from request headers for authentication
    const headersList = headers()
    const apiKey = headersList.get("x-api-key")

    // Basic API key validation
    const validApiKey = process.env.FIGMA_PLUGIN_API_KEY || ""

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid API key" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)
    const search = searchParams.get("search") || ""

    // Get the Supabase client
    const supabase = getServerSupabaseClient()

    // Base query
    let query = supabase
      .from("promoter_contracts")
      .select("id, created_at, contract_data, contract_layout, json_layout")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Add search if provided
    if (search) {
      query = query.or(
        `contract_data->first_party_name_en.ilike.%${search}%,contract_data->second_party_name_en.ilike.%${search}%,contract_data->promoter_name_en.ilike.%${search}%`,
      )
    }

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching contracts:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch contracts" }, { status: 500 })
    }

    // Transform the data to a simpler format for the Figma plugin
    const contracts = data.map((contract) => {
      // Extract metadata from various possible locations
      const contractData = contract.contract_data || {}
      const metadata = contract.contract_layout?.metadata || {}

      return {
        id: contract.id,
        created_at: contract.created_at,
        first_party: contractData.first_party_name_en || metadata.first_party_name?.en || "Unknown",
        second_party: contractData.second_party_name_en || metadata.second_party_name?.en || "Unknown",
        promoter: contractData.promoter_name_en || metadata.promoter_name?.en || "Unknown",
        has_json_layout: !!contract.json_layout,
      }
    })

    // Return the contracts list
    return NextResponse.json({
      success: true,
      data: {
        contracts,
        total: count || contracts.length,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ success: false, error: "An unexpected error occurred" }, { status: 500 })
  }
}
