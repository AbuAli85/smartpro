import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get contract ID from URL params
    const contractId = params.id

    if (!contractId) {
      return NextResponse.json({ error: "Contract ID is required" }, { status: 400 })
    }

    // Use our utility function to get the Supabase client (will return mock client in preview)
    const supabase = getServerSupabaseClient()

    // Fetch contract
    const { data, error } = await supabase
      .from("promoter_contracts")
      .select("id, contract_data, contract_layout, created_at")
      .eq("id", contractId)
      .single()

    if (error) {
      console.error("Error fetching contract:", error)
      return NextResponse.json({ error: "Failed to fetch contract" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    // Return the contract data
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
