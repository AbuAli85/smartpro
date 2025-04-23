import type { NextRequest } from "next/server"
import { z } from "zod"
import { getServerSupabaseClient } from "@/lib/supabase-client"
import {
  validateAuth,
  validateRequest,
  createErrorResponse,
  createSuccessResponse,
  addCorsHeaders,
} from "@/app/lib/edge-function-validation"

// Define the validation schema
const getContractLayoutSchema = z.object({
  contractId: z.string().uuid("Contract ID must be a valid UUID"),
})

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const { error: authError, status: authStatus, user } = await validateAuth(request)

    if (authError) {
      return createErrorResponse(authError, authStatus)
    }

    // Parse and validate request body
    const body = await request.json()
    const { data, error: validationError } = validateRequest(body, getContractLayoutSchema)

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Get Supabase client
    const supabase = getServerSupabaseClient()

    // Fetch contract layout
    const { data: contractData, error: dbError } = await supabase
      .from("promoter_contracts")
      .select("id, contract_layout, created_at")
      .eq("id", data!.contractId)
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return createErrorResponse("Failed to fetch contract layout", 500)
    }

    if (!contractData) {
      return createErrorResponse("Contract not found", 404)
    }

    // Return the contract layout
    const response = createSuccessResponse({
      id: contractData.id,
      created_at: contractData.created_at,
      layout: contractData.contract_layout,
    })

    return addCorsHeaders(response)
  } catch (error) {
    console.error("Unexpected error:", error)
    return createErrorResponse("An unexpected error occurred", 500)
  }
}
