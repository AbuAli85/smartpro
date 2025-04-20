import type { Notification } from "@/contexts/notification-context"

// Template parameter types
export type TemplateParameter = string | number | boolean | Date | null | undefined

// Interface for notification templates
export interface NotificationTemplate {
  id: string
  name: string
  description: string
  category: "approval" | "template" | "system" | "contract" | "general"
  type: "info" | "success" | "warning" | "error"
  messageTemplate: string
  defaultImportant: boolean
  defaultRequiresReadReceipt: boolean
  defaultExpirationHours?: number
  parameters: string[] // Parameter names that can be used in the message template
}

// Function to create a notification from a template
export function createNotificationFromTemplate(
  template: NotificationTemplate,
  params: Record<string, TemplateParameter>,
  overrides?: Partial<Omit<Notification, "id" | "timestamp" | "read" | "readReceipts">>,
): Omit<Notification, "id" | "timestamp" | "read" | "readReceipts"> {
  // Replace parameters in the message template
  let message = template.messageTemplate
  for (const [key, value] of Object.entries(params)) {
    message = message.replace(new RegExp(`{${key}}`, "g"), String(value || ""))
  }

  // Calculate expiration date if defaultExpirationHours is set
  let expiresAt: string | undefined = undefined
  if (template.defaultExpirationHours && !overrides?.expiresAt) {
    const expirationDate = new Date()
    expirationDate.setHours(expirationDate.getHours() + template.defaultExpirationHours)
    expiresAt = expirationDate.toISOString()
  }

  // Create notification object
  return {
    type: template.type,
    message,
    important: overrides?.important ?? template.defaultImportant,
    requiresReadReceipt: overrides?.requiresReadReceipt ?? template.defaultRequiresReadReceipt,
    category: overrides?.category ?? template.category,
    expiresAt: overrides?.expiresAt ?? expiresAt,
    relatedItemId: overrides?.relatedItemId,
    relatedItemType: overrides?.relatedItemType,
    ...overrides,
  }
}

// Predefined notification templates
export const notificationTemplates: NotificationTemplate[] = [
  // Approval templates
  {
    id: "template-submitted",
    name: "Template Submitted",
    description: "Notification when a template is submitted for approval",
    category: "approval",
    type: "info",
    messageTemplate: 'Template "{templateName}" has been submitted for approval.',
    defaultImportant: true,
    defaultRequiresReadReceipt: true,
    defaultExpirationHours: 72, // 3 days
    parameters: ["templateName", "submittedBy"],
  },
  {
    id: "template-approved",
    name: "Template Approved",
    description: "Notification when a template is approved",
    category: "approval",
    type: "success",
    messageTemplate: 'Template "{templateName}" has been approved.',
    defaultImportant: true,
    defaultRequiresReadReceipt: true,
    parameters: ["templateName", "approvedBy"],
  },
  {
    id: "template-rejected",
    name: "Template Rejected",
    description: "Notification when a template is rejected",
    category: "approval",
    type: "warning",
    messageTemplate: 'Template "{templateName}" has been rejected.',
    defaultImportant: true,
    defaultRequiresReadReceipt: true,
    parameters: ["templateName", "rejectedBy", "rejectionReason"],
  },
  {
    id: "approval-reminder",
    name: "Approval Reminder",
    description: "Reminder for pending template approvals",
    category: "approval",
    type: "info",
    messageTemplate: "Reminder: {count} template(s) pending your approval.",
    defaultImportant: true,
    defaultRequiresReadReceipt: false,
    defaultExpirationHours: 24, // 1 day
    parameters: ["count"],
  },

  // Contract templates
  {
    id: "contract-created",
    name: "Contract Created",
    description: "Notification when a contract is created",
    category: "contract",
    type: "success",
    messageTemplate: "Contract #{referenceNumber} has been created successfully.",
    defaultImportant: false,
    defaultRequiresReadReceipt: false,
    parameters: ["referenceNumber", "contractType"],
  },
  {
    id: "contract-updated",
    name: "Contract Updated",
    description: "Notification when a contract is updated",
    category: "contract",
    type: "info",
    messageTemplate: "Contract #{referenceNumber} has been updated.",
    defaultImportant: false,
    defaultRequiresReadReceipt: false,
    parameters: ["referenceNumber", "updatedBy"],
  },
  {
    id: "contract-expiring",
    name: "Contract Expiring",
    description: "Notification when a contract is about to expire",
    category: "contract",
    type: "warning",
    messageTemplate: "Contract #{referenceNumber} will expire in {daysRemaining} days.",
    defaultImportant: true,
    defaultRequiresReadReceipt: true,
    defaultExpirationHours: 168, // 7 days
    parameters: ["referenceNumber", "daysRemaining", "expiryDate"],
  },

  // System templates
  {
    id: "system-maintenance",
    name: "System Maintenance",
    description: "Notification for scheduled system maintenance",
    category: "system",
    type: "info",
    messageTemplate: "System maintenance scheduled for {maintenanceDate}. Expected downtime: {downtimeDuration}.",
    defaultImportant: true,
    defaultRequiresReadReceipt: false,
    defaultExpirationHours: 48, // 2 days
    parameters: ["maintenanceDate", "downtimeDuration", "maintenanceDetails"],
  },
  {
    id: "system-error",
    name: "System Error",
    description: "Notification for system errors",
    category: "system",
    type: "error",
    messageTemplate: "System error: {errorMessage}",
    defaultImportant: true,
    defaultRequiresReadReceipt: false,
    parameters: ["errorMessage", "errorCode", "errorDetails"],
  },

  // General templates
  {
    id: "general-info",
    name: "General Information",
    description: "General information notification",
    category: "general",
    type: "info",
    messageTemplate: "{message}",
    defaultImportant: false,
    defaultRequiresReadReceipt: false,
    parameters: ["message", "title"],
  },
  {
    id: "general-success",
    name: "General Success",
    description: "General success notification",
    category: "general",
    type: "success",
    messageTemplate: "{message}",
    defaultImportant: false,
    defaultRequiresReadReceipt: false,
    parameters: ["message", "title"],
  },
  {
    id: "general-warning",
    name: "General Warning",
    description: "General warning notification",
    category: "general",
    type: "warning",
    messageTemplate: "{message}",
    defaultImportant: false,
    defaultRequiresReadReceipt: false,
    parameters: ["message", "title"],
  },
  {
    id: "general-error",
    name: "General Error",
    description: "General error notification",
    category: "general",
    type: "error",
    messageTemplate: "{message}",
    defaultImportant: false,
    defaultRequiresReadReceipt: false,
    parameters: ["message", "title"],
  },
]

// Function to get a template by ID
export function getTemplateById(templateId: string): NotificationTemplate | undefined {
  return notificationTemplates.find((template) => template.id === templateId)
}

// Function to get templates by category
export function getTemplatesByCategory(category: string): NotificationTemplate[] {
  return notificationTemplates.filter((template) => template.category === category)
}
