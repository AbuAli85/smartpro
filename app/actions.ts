"use server"

import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Function to create a contract
export async function createContract(formData: FormData) {
  try {
    // Extract file uploads
    const idPhoto = formData.get("id_photo") as File
    const passportPhoto = formData.get("passport_photo") as File
    const letterheadImage = formData.get("letterhead_image") as File

    // Upload files to Vercel Blob
    const [idPhotoBlob, passportPhotoBlob, letterheadImageBlob] = await Promise.all([
      put(`contract-uploads/${Date.now()}-${idPhoto.name}`, idPhoto, {
        access: "public",
      }),
      put(`contract-uploads/${Date.now()}-${passportPhoto.name}`, passportPhoto, {
        access: "public",
      }),
      put(`contract-uploads/${Date.now()}-${letterheadImage.name}`, letterheadImage, {
        access: "public",
      }),
    ])

    // Extract form data
    const contractData = {
      first_party_name_en: formData.get("first_party_name_en"),
      first_party_cr: formData.get("first_party_cr"),
      second_party_name_en: formData.get("second_party_name_en"),
      second_party_cr: formData.get("second_party_cr"),
      promoter_name_en: formData.get("promoter_name_en"),
      promoter_id: formData.get("promoter_id"),
      product_name_en: formData.get("product_name_en"),
      location_name_en: formData.get("location_name_en"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      id_photo_url: idPhotoBlob.url,
      passport_photo_url: passportPhotoBlob.url,
      letterhead_image_url: letterheadImageBlob.url,
    }

    // Generate contract layout by sending data to Supabase Edge Function or external API
    // For this example, we'll simulate the response
    const contractLayout = {
      version: "1.0",
      layout: {
        header: {
          logo: letterheadImageBlob.url,
          title: "Bilingual Promotion Contract",
        },
        sections: [
          {
            type: "parties",
            first_party: {
              name: contractData.first_party_name_en,
              cr: contractData.first_party_cr,
            },
            second_party: {
              name: contractData.second_party_name_en,
              cr: contractData.second_party_cr,
            },
          },
          {
            type: "promoter",
            name: contractData.promoter_name_en,
            id: contractData.promoter_id,
            id_photo: idPhotoBlob.url,
            passport_photo: passportPhotoBlob.url,
          },
          {
            type: "details",
            product: contractData.product_name_en,
            location: contractData.location_name_en,
            period: {
              start: contractData.start_date,
              end: contractData.end_date,
            },
          },
        ],
      },
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("promoter_contracts")
      .insert({
        contract_data: contractData,
        contract_layout: contractLayout,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error saving to Supabase:", error)
      return { success: false, error: error.message }
    }

    // Create approval tokens for both parties
    const contractId = data.id
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // Tokens expire in 30 days

    // Create tokens for both parties
    await Promise.all([
      // First party token
      supabase
        .from("approval_tokens")
        .insert({
          contract_id: contractId,
          token: uuidv4(),
          party_role: "first_party",
          party_name: contractData.first_party_name_en,
          party_id: contractData.first_party_cr,
          used: false,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        }),
      // Second party token
      supabase
        .from("approval_tokens")
        .insert({
          contract_id: contractId,
          token: uuidv4(),
          party_role: "second_party",
          party_name: contractData.second_party_name_en,
          party_id: contractData.second_party_cr,
          used: false,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        }),
    ])

    // Log the contract creation in audit_logs
    await supabase.from("audit_logs").insert({
      id: uuidv4(),
      resource_type: "contract",
      action: "create",
      details: {
        contract_id: contractId,
        promoter_name: contractData.promoter_name_en,
      },
      created_at: new Date().toISOString(),
    })

    // Revalidate the contracts page
    revalidatePath("/contracts")

    return {
      success: true,
      contractId: contractId,
    }
  } catch (error) {
    console.error("Error creating contract:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Function to get approval tokens for a contract
export async function getApprovalTokens(contractId: string) {
  try {
    const { data, error } = await supabase.from("approval_tokens").select("*").eq("contract_id", contractId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, tokens: data }
  } catch (error) {
    return { success: false, error: "Failed to fetch approval tokens" }
  }
}

// Function to approve a token
export async function approveToken(token: string) {
  // First, get the token data
  const { data: tokenData, error: tokenError } = await supabase
    .from("approval_tokens")
    .select("*")
    .eq("token", token)
    .single()

  if (tokenError || !tokenData) {
    return { success: false, error: "Invalid token" }
  }

  // Check if token is already used
  if (tokenData.used) {
    return { success: false, error: "Token already used" }
  }

  // Check if token is expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return { success: false, error: "Token expired" }
  }

  // Mark token as used
  const { error: updateError } = await supabase
    .from("approval_tokens")
    .update({
      used: true,
      used_at: new Date().toISOString(),
    })
    .eq("token", token)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Log the approval in audit_logs
  const { error: auditError } = await supabase.from("audit_logs").insert({
    id: uuidv4(),
    resource_type: "contract_approval",
    action: "approve",
    details: {
      contract_id: tokenData.contract_id,
      party_role: tokenData.party_role,
      party_name: tokenData.party_name,
    },
    created_at: new Date().toISOString(),
  })

  if (auditError) {
    console.error("Error logging audit:", auditError)
    // Continue even if audit logging fails
  }

  return { success: true, contractId: tokenData.contract_id }
}
