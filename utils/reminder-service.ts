import { getTemplatesPendingApproval } from "./template-storage"
import { sendPendingApprovalsReminder, getApproverEmails } from "./email-service"

// Last reminder timestamps
const reminderTimestamps = {
  daily: null as Date | null,
  weekly: null as Date | null,
}

/**
 * Check if reminders should be sent based on frequency and last sent time
 * @param frequency Reminder frequency (daily or weekly)
 * @returns True if reminders should be sent
 */
function shouldSendReminders(frequency: "daily" | "weekly"): boolean {
  const now = new Date()
  const lastSent = reminderTimestamps[frequency]

  if (!lastSent) return true

  if (frequency === "daily") {
    // Check if it's been at least 24 hours since the last daily reminder
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return lastSent < oneDayAgo
  } else if (frequency === "weekly") {
    // Check if it's been at least 7 days since the last weekly reminder
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return lastSent < oneWeekAgo
  }

  return false
}

/**
 * Send reminders for pending approvals based on frequency
 * @param frequency Reminder frequency (daily or weekly)
 */
export async function sendPendingApprovalReminders(frequency: "daily" | "weekly"): Promise<void> {
  // Check if reminders should be sent
  if (!shouldSendReminders(frequency)) return

  // Get pending templates
  const pendingTemplates = getTemplatesPendingApproval()

  // If there are no pending templates, don't send reminders
  if (pendingTemplates.length === 0) return

  // Get approver emails
  const approverEmails = getApproverEmails()

  // Send reminders
  await sendPendingApprovalsReminder(pendingTemplates, approverEmails)

  // Update last sent timestamp
  reminderTimestamps[frequency] = new Date()

  console.log(
    `Sent ${frequency} reminders for ${pendingTemplates.length} pending templates to ${approverEmails.length} approvers`,
  )
}

/**
 * Initialize reminder service
 * This would typically be called when the application starts
 */
export function initializeReminderService(): void {
  // Check for pending approvals every hour
  setInterval(
    () => {
      // Check for daily reminders
      sendPendingApprovalReminders("daily")

      // Check for weekly reminders
      sendPendingApprovalReminders("weekly")
    },
    60 * 60 * 1000,
  ) // 1 hour

  // Also check immediately on startup
  sendPendingApprovalReminders("daily")
  sendPendingApprovalReminders("weekly")

  console.log("Reminder service initialized")
}
