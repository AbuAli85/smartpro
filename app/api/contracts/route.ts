import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { storageService } from "@/services/storage-service"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Supabase
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "contractType",
      "firstPartyName",
      "secondPartyName",
      "startDate",
      "endDate",
      "responsibilities",
      "signature",
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Generate a reference number if not provided
    const referenceNumber =
      body.referenceNumber || `PRM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`

    // Upload signature and stamp if they are base64 strings
    let signatureUrl = null
    let stampUrl = null

    if (body.signature && body.signature.startsWith("data:")) {
      signatureUrl = await storageService.uploadBase64Image(body.signature, "signatures", session.user.id)
    }

    if (body.stamp && body.stamp.startsWith("data:")) {
      stampUrl = await storageService.uploadBase64Image(body.stamp, "stamps", session.user.id)
    }

    // Create the contract in the database
    const { data: contract, error } = await supabase
      .from("contracts")
      .insert({
        id: uuidv4(),
        user_id: session.user.id,
        contract_type: body.contractType,
        first_party_name: body.firstPartyName,
        second_party_name: body.secondPartyName,
        start_date: body.startDate,
        end_date: body.endDate,
        responsibilities: body.responsibilities,
        reference_number: referenceNumber,
        language: body.language || "en",
        status: "active",
        signature_url: signatureUrl,
        stamp_url: stampUrl,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating contract:", error)
      return NextResponse.json({ error: "Failed to create contract" }, { status: 500 })
    }

    // Return the created contract
    return NextResponse.json(contract)
  } catch (error) {
    console.error("Error in contract creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Supabase
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build the query
    let query = supabase
      .from("contracts")
      .select("*", { count: "exact" })
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    // Add search if provided
    if (search) {
      query = query.or(
        `first_party_name.ilike.%${search}%,second_party_name.ilike.%${search}%,reference_number.ilike.%${search}%`,
      )
    }

    // Add pagination
    query = query.range(from, to)

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching contracts:", error)
      return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 })
    }

    // Return the contracts with pagination info
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error in contract fetch:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
