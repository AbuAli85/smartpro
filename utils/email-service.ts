import { ApprovalStatus, type ContractTemplate } from "@/types/template"

// In a real application, you would use a proper email service like SendGrid, Resend, or Nodemailer
// For this demo, we'll simulate email sending with console logs and return promises

interface EmailOptions {
  to: string
  subject: string
  body: string
}

/**
 * Send an email (simulated for demo purposes)
 * @param options Email options including recipient, subject, and body
 * @returns Promise that resolves when the email is "sent"
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  // In a real application, this would connect to an email service
  console.log("📧 SENDING EMAIL:")
  console.log(`To: ${options.to}`)
  console.log(`Subject: ${options.subject}`)
  console.log(`Body: ${options.body}`)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simulate successful email sending
  return { success: true, message: "Email sent successfully" }
}

/**
 * Send a notification when a template is submitted for approval
 * @param template The template that was submitted
 * @param approverEmails List of approver email addresses
 */
export async function sendSubmissionNotification(template: ContractTemplate, approverEmails: string[]): Promise<void> {
  const subject = `Template Submitted for Approval: ${template.name}`
  const body = `
A new template has been submitted for your approval.

Template: ${template.name}
Category: ${template.category}
Submitted by: ${template.approvalRequestedBy || "Unknown"}
Submitted on: ${new Date(template.approvalRequestedAt || "").toLocaleString()}

${template.approvalComments ? `Comments: ${template.approvalComments}` : ""}

Please review this template at your earliest convenience.
  `

  // Send to all approvers
  for (const email of approverEmails) {
    await sendEmail({
      to: email,
      subject,
      body,
    })
  }
}

/**
 * Send a notification when a template's approval status changes
 * @param template The template with updated status
 * @param creatorEmail Email of the template creator
 */
export async function sendStatusChangeNotification(template: ContractTemplate, creatorEmail: string): Promise<void> {
  let subject = ""
  let body = ""

  switch (template.approvalStatus) {
    case ApprovalStatus.Approved:
      subject = `Template Approved: ${template.name}`
      body = `
Your template "${template.name}" has been approved and is now published.

Approved by: ${template.approvedBy || "Unknown"}
Approved on: ${new Date(template.approvedAt || "").toLocaleString()}

${template.approvalComments ? `Comments: ${template.approvalComments}` : ""}

Your template is now available for all users.
      `
      break

    case ApprovalStatus.Rejected:
      subject = `Template Rejected: ${template.name}`
      body = `
Your template "${template.name}" has been rejected.

Rejected by: ${template.rejectedBy || "Unknown"}
Rejected on: ${new Date(template.rejectedAt || "").toLocaleString()}

${template.approvalComments ? `Comments: ${template.approvalComments}` : "No comments provided."}

Please review the feedback and make necessary changes before resubmitting.
      `
      break

    default:
      return // Don't send for other statuses
  }

  await sendEmail({
    to: creatorEmail,
    subject,
    body,
  })
}

/**
 * Send a reminder to approvers about pending templates
 * @param pendingTemplates List of templates pending approval
 * @param approverEmails List of approver email addresses
 */
export async function sendPendingApprovalsReminder(
  pendingTemplates: ContractTemplate[],
  approverEmails: string[],
): Promise<void> {
  if (pendingTemplates.length === 0) return

  const subject = `Reminder: ${pendingTemplates.length} Templates Pending Your Approval`

  let body = `
You have ${pendingTemplates.length} template${pendingTemplates.length > 1 ? "s" : ""} pending your approval:

`

  // Add each pending template to the email
  pendingTemplates.forEach((template, index) => {
    body += `
${index + 1}. ${template.name}
   Category: ${template.category}
   Submitted by: ${template.approvalRequestedBy || "Unknown"}
   Submitted on: ${new Date(template.approvalRequestedAt || "").toLocaleString()}
`
  })

  body += `
Please review these templates at your earliest convenience.
  `

  // Send to all approvers
  for (const email of approverEmails) {
    await sendEmail({
      to: email,
      subject,
      body,
    })
  }
}

/**
 * Get user email by name (simulated for demo purposes)
 * In a real application, this would query a user database
 * @param userName Name of the user
 * @returns Email address of the user
 */
export function getUserEmailByName(userName: string): string {
  // This is a simplified mock function
  // In a real application, you would query your user database

  // Mock user data
  const userMap: Record<string, string> = {
    "Current User": "user@example.com",
    "Regular User": "user@example.com",
    "Template Approver": "approver@example.com",
    "System Admin": "admin@example.com",
    System: "system@example.com",
  }

  return userMap[userName] || "unknown@example.com"
}

/**
 * Get all approver emails (simulated for demo purposes)
 * In a real application, this would query your user database for users with approver role
 * @returns List of approver email addresses
 */
export function getApproverEmails(): string[] {
  // This is a simplified mock function
  // In a real application, you would query your user database for users with approver role
  return ["approver@example.com", "admin@example.com"]
}
