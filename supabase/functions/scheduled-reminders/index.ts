import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { sendEmail } from "../_shared/email.ts"

// This function is designed to be run on a schedule (e.g., daily)
Deno.serve(async () => {
  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago

    // Get templates pending approval for more than 7 days with no reminder or last reminder more than 3 days ago
    const { data: overdueTemplates, error: templateError } = await supabaseClient
      .from("templates")
      .select(`
        id, name, assigned_approver_id, approval_requested_at, last_reminder_sent,
        user_profiles!assigned_approver_id(full_name, user_id),
        auth.users!user_profiles(email)
      `)
      .eq("approval_status", "pending_approval")
      .lt("approval_requested_at", sevenDaysAgo.toISOString())
      .or(`last_reminder_sent.is.null,last_reminder_sent.lt.${threeDaysAgo.toISOString()}`)

    if (templateError) {
      throw new Error(`Error fetching overdue templates: ${templateError.message}`)
    }

    // Get contracts pending approval for more than 7 days with no reminder or last reminder more than 3 days ago
    const { data: overdueContracts, error: contractError } = await supabaseClient
      .from("contracts")
      .select(`
        id, first_party_name, second_party_name, reference_number, assigned_approver_id, created_at, last_reminder_sent,
        user_profiles!assigned_approver_id(full_name, user_id),
        auth.users!user_profiles(email)
      `)
      .eq("status", "pending_approval")
      .lt("created_at", sevenDaysAgo.toISOString())
      .or(`last_reminder_sent.is.null,last_reminder_sent.lt.${threeDaysAgo.toISOString()}`)

    if (contractError) {
      throw new Error(`Error fetching overdue contracts: ${contractError.message}`)
    }

    // Process templates
    const templateResults = await Promise.all(
      (overdueTemplates || []).map(async (template) => {
        try {
          // Skip if no approver assigned
          if (!template.assigned_approver_id || !template.auth?.users?.email) {
            return { id: template.id, success: false, error: "No approver assigned" }
          }

          // Send reminder email
          const emailResult = await sendEmail({
            to: template.auth.users.email,
            subject: "OVERDUE: Template Approval Required",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Overdue Approval Reminder</h2>
                <p>Dear ${template.user_profiles?.full_name || "Approver"},</p>
                <p>This is an <strong>urgent reminder</strong> that your approval for the following template has been pending for over 7 days:</p>
                <div style="background-color: #fff0f0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ff0000;">
                  <p><strong>${template.name}</strong></p>
                  <p>Template ID: ${template.id}</p>
                  <p>Pending since: ${new Date(template.approval_requested_at).toLocaleDateString()}</p>
                </div>
                <p>Please review and take action on this template as soon as possible.</p>
                <p><a href="${Deno.env.get("NEXT_PUBLIC_APP_URL")}/templates/approve/${template.id}" style="display: inline-block; background-color: #ff3e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Template Now</a></p>
                <p>Thank you,<br>Contract Management System</p>
              </div>
            `,
          })

          if (!emailResult.success) {
            return { id: template.id, success: false, error: emailResult.error }
          }

          // Update the last_reminder_sent timestamp
          const { error: updateError } = await supabaseClient
            .from("templates")
            .update({ last_reminder_sent: now.toISOString() })
            .eq("id", template.id)

          if (updateError) {
            return { id: template.id, success: false, error: updateError.message }
          }

          // Record the activity
          await supabaseClient.from("user_activities").insert({
            user_id: null,
            activity_type: "automated_reminder_sent",
            description: `Automated reminder sent for template approval: ${template.name}`,
            related_item_id: template.id,
            related_item_type: "template",
          })

          return { id: template.id, success: true }
        } catch (error) {
          return { id: template.id, success: false, error: error.message }
        }
      }),
    )

    // Process contracts
    const contractResults = await Promise.all(
      (overdueContracts || []).map(async (contract) => {
        try {
          // Skip if no approver assigned
          if (!contract.assigned_approver_id || !contract.auth?.users?.email) {
            return { id: contract.id, success: false, error: "No approver assigned" }
          }

          // Send reminder email
          const emailResult = await sendEmail({
            to: contract.auth.users.email,
            subject: "OVERDUE: Contract Approval Required",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Overdue Approval Reminder</h2>
                <p>Dear ${contract.user_profiles?.full_name || "Approver"},</p>
                <p>This is an <strong>urgent reminder</strong> that your approval for the following contract has been pending for over 7 days:</p>
                <div style="background-color: #fff0f0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ff0000;">
                  <p><strong>${contract.first_party_name} & ${contract.second_party_name}</strong></p>
                  <p>Reference: ${contract.reference_number}</p>
                  <p>Pending since: ${new Date(contract.created_at).toLocaleDateString()}</p>
                </div>
                <p>Please review and take action on this contract as soon as possible.</p>
                <p><a href="${Deno.env.get("NEXT_PUBLIC_APP_URL")}/contracts/approve/${contract.id}" style="display: inline-block; background-color: #ff3e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Contract Now</a></p>
                <p>Thank you,<br>Contract Management System</p>
              </div>
            `,
          })

          if (!emailResult.success) {
            return { id: contract.id, success: false, error: emailResult.error }
          }

          // Update the last_reminder_sent timestamp
          const { error: updateError } = await supabaseClient
            .from("contracts")
            .update({ last_reminder_sent: now.toISOString() })
            .eq("id", contract.id)

          if (updateError) {
            return { id: contract.id, success: false, error: updateError.message }
          }

          // Record the activity
          await supabaseClient.from("user_activities").insert({
            user_id: null,
            activity_type: "automated_reminder_sent",
            description: `Automated reminder sent for contract approval: ${contract.first_party_name} & ${contract.second_party_name}`,
            related_item_id: contract.id,
            related_item_type: "contract",
          })

          return { id: contract.id, success: true }
        } catch (error) {
          return { id: contract.id, success: false, error: error.message }
        }
      }),
    )

    // Compile results
    const results = {
      templates: {
        total: overdueTemplates?.length || 0,
        successful: templateResults.filter((r) => r.success).length,
        failed: templateResults.filter((r) => !r.success).length,
      },
      contracts: {
        total: overdueContracts?.length || 0,
        successful: contractResults.filter((r) => r.success).length,
        failed: contractResults.filter((r) => !r.success).length,
      },
      details: {
        templateResults,
        contractResults,
      },
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
