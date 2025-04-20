import type { ContractTemplate } from "@/types/template"
import { ApprovalStatus } from "@/types/template"
import { createNewVersion } from "./version-history"
import {
  sendSubmissionNotification,
  sendStatusChangeNotification,
  getApproverEmails,
  getUserEmailByName,
} from "./email-service"

// Local storage key for custom templates
const CUSTOM_TEMPLATES_KEY = "contract_custom_templates"

/**
 * Save a custom template to local storage
 * @param template The template to save
 */
export function saveCustomTemplate(template: ContractTemplate): void {
  try {
    // Get existing templates
    const existingTemplates = getCustomTemplates()

    // Check if this is a new template or an update
    const isNewTemplate = !existingTemplates.some((t) => t.id === template.id)

    // If it's a new template, ensure it has version information and approval status
    const templateToSave = isNewTemplate
      ? {
          ...template,
          version: 1,
          createdAt: template.createdAt || new Date().toISOString(),
          updatedAt: template.updatedAt || new Date().toISOString(),
          versionHistory: [],
          approvalStatus: template.approvalStatus || ApprovalStatus.Draft,
          isPublished: template.isPublished || false,
        }
      : template

    // Add or update template
    const updatedTemplates = isNewTemplate
      ? [...existingTemplates, templateToSave]
      : existingTemplates.map((t) => (t.id === template.id ? templateToSave : t))

    // Save to local storage
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updatedTemplates))
  } catch (error) {
    console.error("Error saving custom template:", error)
  }
}

/**
 * Update an existing template with version tracking
 * @param template The template to update
 * @param changeNotes Notes about what changed
 * @param username Username of the person making the change
 * @returns The updated template with new version information
 */
export function updateTemplateWithVersion(
  template: ContractTemplate,
  changeNotes = "",
  username = "Current User",
): ContractTemplate {
  try {
    // Get existing templates
    const existingTemplates = getCustomTemplates()

    // Find the current template
    const currentTemplate = existingTemplates.find((t) => t.id === template.id)

    if (!currentTemplate) {
      // If template doesn't exist, just save it as a new template
      const newTemplate = {
        ...template,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: username,
        lastModifiedBy: username,
        versionHistory: [],
        approvalStatus: ApprovalStatus.Draft,
        isPublished: false,
      }
      saveCustomTemplate(newTemplate)
      return newTemplate
    }

    // Create a new version
    const updatedTemplate = createNewVersion(currentTemplate, changeNotes, username)

    // If the template was previously approved, set it back to draft
    if (updatedTemplate.approvalStatus === ApprovalStatus.Approved) {
      updatedTemplate.approvalStatus = ApprovalStatus.Draft
      updatedTemplate.approvedAt = undefined
      updatedTemplate.approvedBy = undefined
    }

    // Save the updated template
    saveCustomTemplate(updatedTemplate)

    return updatedTemplate
  } catch (error) {
    console.error("Error updating template with version:", error)
    return template
  }
}

/**
 * Submit a template for approval
 * @param templateId ID of the template to submit
 * @param username Username of the person submitting
 * @returns The updated template or null if not found
 */
export async function submitTemplateForApproval(
  templateId: string,
  username = "Current User",
): Promise<ContractTemplate | null> {
  try {
    const templates = getCustomTemplates()
    const template = templates.find((t) => t.id === templateId)

    if (!template) return null

    const updatedTemplate = {
      ...template,
      approvalStatus: ApprovalStatus.PendingApproval,
      approvalRequestedAt: new Date().toISOString(),
      approvalRequestedBy: username,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: username,
    }

    saveCustomTemplate(updatedTemplate)

    // Send email notifications to approvers
    try {
      const approverEmails = getApproverEmails()
      await sendSubmissionNotification(updatedTemplate, approverEmails)
    } catch (error) {
      console.error("Error sending submission notification:", error)
    }

    return updatedTemplate
  } catch (error) {
    console.error("Error submitting template for approval:", error)
    return null
  }
}

/**
 * Approve a template
 * @param templateId ID of the template to approve
 * @param comments Optional approval comments
 * @param username Username of the approver
 * @returns The updated template or null if not found
 */
export async function approveTemplate(
  templateId: string,
  comments = "",
  username = "Approver",
): Promise<ContractTemplate | null> {
  try {
    const templates = getCustomTemplates()
    const template = templates.find((t) => t.id === templateId)

    if (!template) return null

    const updatedTemplate = {
      ...template,
      approvalStatus: ApprovalStatus.Approved,
      approvedAt: new Date().toISOString(),
      approvedBy: username,
      approvalComments: comments,
      isPublished: true,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: username,
    }

    saveCustomTemplate(updatedTemplate)

    // Send email notification to template creator
    try {
      if (template.createdBy) {
        const creatorEmail = getUserEmailByName(template.createdBy)
        await sendStatusChangeNotification(updatedTemplate, creatorEmail)
      }
    } catch (error) {
      console.error("Error sending approval notification:", error)
    }

    return updatedTemplate
  } catch (error) {
    console.error("Error approving template:", error)
    return null
  }
}

/**
 * Reject a template
 * @param templateId ID of the template to reject
 * @param comments Rejection comments
 * @param username Username of the rejector
 * @returns The updated template or null if not found
 */
export async function rejectTemplate(
  templateId: string,
  comments = "",
  username = "Approver",
): Promise<ContractTemplate | null> {
  try {
    const templates = getCustomTemplates()
    const template = templates.find((t) => t.id === templateId)

    if (!template) return null

    const updatedTemplate = {
      ...template,
      approvalStatus: ApprovalStatus.Rejected,
      rejectedAt: new Date().toISOString(),
      rejectedBy: username,
      approvalComments: comments,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: username,
    }

    saveCustomTemplate(updatedTemplate)

    // Send email notification to template creator
    try {
      if (template.createdBy) {
        const creatorEmail = getUserEmailByName(template.createdBy)
        await sendStatusChangeNotification(updatedTemplate, creatorEmail)
      }
    } catch (error) {
      console.error("Error sending rejection notification:", error)
    }

    return updatedTemplate
  } catch (error) {
    console.error("Error rejecting template:", error)
    return null
  }
}

/**
 * Get all custom templates from local storage
 * @returns Array of custom templates
 */
export function getCustomTemplates(): ContractTemplate[] {
  try {
    const templatesJson = localStorage.getItem(CUSTOM_TEMPLATES_KEY)
    if (!templatesJson) return []

    const templates = JSON.parse(templatesJson)

    // Ensure all templates have version, category, and approval status (for backward compatibility)
    return templates.map((template: ContractTemplate) => ({
      ...template,
      category: template.category || "general",
      version: template.version || 1,
      versionHistory: template.versionHistory || [],
      approvalStatus: template.approvalStatus || ApprovalStatus.Draft,
      isPublished: template.isPublished || false,
    }))
  } catch (error) {
    console.error("Error retrieving custom templates:", error)
    return []
  }
}

/**
 * Get templates pending approval
 * @returns Array of templates pending approval
 */
export function getTemplatesPendingApproval(): ContractTemplate[] {
  try {
    const templates = getCustomTemplates()
    return templates.filter((t) => t.approvalStatus === ApprovalStatus.PendingApproval)
  } catch (error) {
    console.error("Error getting templates pending approval:", error)
    return []
  }
}

/**
 * Get published templates (approved and published)
 * @returns Array of published templates
 */
export function getPublishedTemplates(): ContractTemplate[] {
  try {
    const templates = getCustomTemplates()
    return templates.filter((t) => t.isPublished && t.approvalStatus === ApprovalStatus.Approved)
  } catch (error) {
    console.error("Error getting published templates:", error)
    return []
  }
}

/**
 * Get a specific template by ID
 * @param templateId ID of the template to get
 * @returns The template or null if not found
 */
export function getTemplateById(templateId: string): ContractTemplate | null {
  try {
    const templates = getCustomTemplates()
    return templates.find((t) => t.id === templateId) || null
  } catch (error) {
    console.error("Error getting template by ID:", error)
    return null
  }
}

/**
 * Delete a custom template from local storage
 * @param templateId ID of the template to delete
 */
export function deleteCustomTemplate(templateId: string): void {
  try {
    const existingTemplates = getCustomTemplates()
    const updatedTemplates = existingTemplates.filter((template) => template.id !== templateId)
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updatedTemplates))
  } catch (error) {
    console.error("Error deleting custom template:", error)
  }
}

/**
 * Apply a template to form values
 * @param template The template to apply
 * @returns Object with values to set in the form
 */
export function applyTemplate(template: ContractTemplate): any {
  // Calculate default dates if template has defaultDuration
  const startDate = new Date()
  const endDate = new Date()

  if (template.defaultDuration) {
    endDate.setDate(startDate.getDate() + template.defaultDuration)
  } else {
    // Default to 30 days if no duration specified
    endDate.setDate(startDate.getDate() + 30)
  }

  // Format dates as YYYY-MM-DD for form inputs
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  return {
    contractType: template.contractType,
    responsibilities: template.responsibilities,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  }
}

/**
 * Validate an imported template
 * @param template The template to validate
 * @returns Object with validation result
 */
export function validateImportedTemplate(template: any): { valid: boolean; error?: string } {
  // Check if template is an object
  if (!template || typeof template !== "object") {
    return { valid: false, error: "Invalid template format" }
  }

  // Check required fields
  const requiredFields = ["name", "contractType", "responsibilities"]
  for (const field of requiredFields) {
    if (!template[field]) {
      return { valid: false, error: `Missing required field: ${field}` }
    }
  }

  // Validate field types
  if (typeof template.name !== "string") {
    return { valid: false, error: "Template name must be a string" }
  }

  if (typeof template.contractType !== "string") {
    return { valid: false, error: "Contract type must be a string" }
  }

  if (typeof template.responsibilities !== "string") {
    return { valid: false, error: "Responsibilities must be a string" }
  }

  // Optional field validation
  if (template.defaultDuration && typeof template.defaultDuration !== "number") {
    return { valid: false, error: "Default duration must be a number" }
  }

  if (template.description && typeof template.description !== "string") {
    return { valid: false, error: "Description must be a string" }
  }

  // Ensure category is valid or set default
  if (template.category && typeof template.category !== "string") {
    return { valid: false, error: "Category must be a string" }
  }

  return { valid: true }
}

/**
 * Get templates by category
 * @param templates Array of templates
 * @param categoryId Category ID to filter by
 * @returns Filtered array of templates
 */
export function getTemplatesByCategory(templates: ContractTemplate[], categoryId: string): ContractTemplate[] {
  if (!categoryId) return templates
  return templates.filter((template) => template.category === categoryId)
}

/**
 * Search templates by query
 * @param templates Array of templates
 * @param query Search query
 * @returns Filtered array of templates
 */
export function searchTemplates(templates: ContractTemplate[], query: string): ContractTemplate[] {
  if (!query) return templates

  const lowerQuery = query.toLowerCase()
  return templates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.responsibilities.toLowerCase().includes(lowerQuery),
  )
}
