import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"
import { sendEmail } from "../_shared/email.ts"

interface ReminderRequest {
  itemId: string
  itemType: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    })

    // Get the request body
    const { itemId, itemType } = (await req.json()) as ReminderRequest

    // Validate required parameters
    if (!itemId || !itemType) {
      return new Response(JSON.stringify({ error: "Missing required parameters: itemId and itemType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Validate item type
    if (itemType !== "template" && itemType !== "contract") {
      return new Response(JSON.stringify({ error: 'Invalid itemType. Must be "template" or "contract"' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Get the current timestamp
    const now = new Date().toISOString()

    // Update the item with the reminder timestamp and get approver information
    let approverEmail = ""
    let approverName = ""
    let itemName = ""
    let itemReference = ""
    let itemUrl = ""

    if (itemType === "template") {
      // Get template and approver information
      const { data: template, error: templateError } = await supabaseClient
        .from("templates")
        .select(`
          id, name, assigned_approver_id,
          user_profiles!assigned_approver_id(full_name, user_id),
          auth.users!user_profiles(email)
        `)
        .eq("id", itemId)
        .single()

      if (templateError) {
        throw new Error(`Error fetching template: ${templateError.message}`)
      }

      if (!template) {
        return new Response(JSON.stringify({ error: "Template not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Update the template with the reminder timestamp
      const { error: updateError } = await supabaseClient
        .from("templates")
        .update({ last_reminder_sent: now })
        .eq("id", itemId)

      if (updateError) {
        throw new Error(`Error updating template: ${updateError.message}`)
      }

      // Extract approver information
      approverName = template.user_profiles?.full_name || "Approver"
      approverEmail = template.auth?.users?.email || ""
      itemName = template.name
      itemReference = `Template ID: ${template.id}`
      itemUrl = `${Deno.env.get("NEXT_PUBLIC_APP_URL")}/templates/approve/${template.id}`
    } else {
      // Get contract and approver information
      const { data: contract, error: contractError } = await supabaseClient
        .from("contracts")
        .select(`
          id, first_party_name, second_party_name, reference_number, assigned_approver_id,
          user_profiles!assigned_approver_id(full_name, user_id),
          auth.users!user_profiles(email)
        `)
        .eq("id", itemId)
        .single()

      if (contractError) {
        throw new Error(`Error fetching contract: ${contractError.message}`)
      }

      if (!contract) {
        return new Response(JSON.stringify({ error: "Contract not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Update the contract with the reminder timestamp
      const { error: updateError } = await supabaseClient
        .from("contracts")
        .update({ last_reminder_sent: now })
        .eq("id", itemId)

      if (updateError) {
        throw new Error(`Error updating contract: ${updateError.message}`)
      }

      // Extract approver information
      approverName = contract.user_profiles?.full_name || "Approver"
      approverEmail = contract.auth?.users?.email || ""
      itemName = `${contract.first_party_name} & ${contract.second_party_name}`
      itemReference = `Reference: ${contract.reference_number}`
      itemUrl = `${Deno.env.get("NEXT_PUBLIC_APP_URL")}/contracts/approve/${contract.id}`
    }

    // Validate approver email
    if (!approverEmail) {
      return new Response(JSON.stringify({ error: "Approver email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Send email notification
    const emailResult = await sendEmail({
      to: approverEmail,
      subject: `Reminder: ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Approval Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Approval Reminder</h2>
          <p>Dear ${approverName},</p>
          <p>This is a reminder that your approval is required for the following ${itemType}:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>${itemName}</strong></p>
            <p>${itemReference}</p>
          </div>
          <p>Please review and take action on this ${itemType} at your earliest convenience.</p>
          <p><a href="${itemUrl}" style="display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}</a></p>
          <p>Thank you,<br>Contract Management System</p>
        </div>
      `,
    })

    if (!emailResult.success) {
      throw new Error(`Error sending email: ${emailResult.error}`)
    }

    // Record the reminder in the activity log
    const { error: activityError } = await supabaseClient.from("user_activities").insert({
      user_id: null, // System-generated activity
      activity_type: "reminder_sent",
      description: `Reminder sent for ${itemType} approval: ${itemName}`,
      related_item_id: itemId,
      related_item_type: itemType,
    })

    if (activityError) {
      console.error(`Error recording activity: ${activityError.message}`)
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Reminder sent to ${approverEmail}`,
        timestamp: now,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    // Return error response
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
