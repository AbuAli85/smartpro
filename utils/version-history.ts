import type { ContractTemplate, TemplateVersion } from "@/types/template"

/**
 * Create a new version of a template
 * @param template The template to create a version for
 * @param changeNotes Notes about what changed in this version
 * @param username Username of the person making the change
 * @returns The updated template with new version information
 */
export function createNewVersion(
  template: ContractTemplate,
  changeNotes = "",
  username = "Current User",
): ContractTemplate {
  // Create a version record from the current template
  const currentVersion: TemplateVersion = {
    id: `version-${Date.now()}`,
    templateId: template.id,
    version: template.version,
    name: template.name,
    description: template.description,
    contractType: template.contractType,
    responsibilities: template.responsibilities,
    defaultDuration: template.defaultDuration,
    category: template.category,
    createdAt: new Date().toISOString(),
    createdBy: username,
    changeNotes,
  }

  // Get existing version history or initialize empty array
  const versionHistory = template.versionHistory || []

  // Create updated template with incremented version
  const updatedTemplate: ContractTemplate = {
    ...template,
    version: template.version + 1,
    versionHistory: [...versionHistory, currentVersion],
    updatedAt: new Date().toISOString(),
    lastModifiedBy: username,
  }

  return updatedTemplate
}

/**
 * Restore a template to a previous version
 * @param template The current template
 * @param versionId The ID of the version to restore
 * @param username Username of the person restoring the version
 * @returns The restored template with updated version information
 */
export function restoreVersion(
  template: ContractTemplate,
  versionId: string,
  username = "Current User",
): ContractTemplate | null {
  // Find the version to restore
  const versionToRestore = template.versionHistory?.find((v) => v.id === versionId)
  if (!versionToRestore) return null

  // Create a version record of the current state before restoring
  const currentVersion: TemplateVersion = {
    id: `version-${Date.now()}`,
    templateId: template.id,
    version: template.version,
    name: template.name,
    description: template.description,
    contractType: template.contractType,
    responsibilities: template.responsibilities,
    defaultDuration: template.defaultDuration,
    category: template.category,
    createdAt: new Date().toISOString(),
    createdBy: username,
    changeNotes: `State before restoring to version ${versionToRestore.version}`,
  }

  // Create restored template with incremented version
  const restoredTemplate: ContractTemplate = {
    ...template,
    name: versionToRestore.name,
    description: versionToRestore.description,
    contractType: versionToRestore.contractType,
    responsibilities: versionToRestore.responsibilities,
    defaultDuration: versionToRestore.defaultDuration,
    category: versionToRestore.category,
    version: template.version + 1,
    versionHistory: [...(template.versionHistory || []), currentVersion],
    updatedAt: new Date().toISOString(),
    lastModifiedBy: username,
  }

  return restoredTemplate
}

/**
 * Compare two template versions and get the differences
 * @param version1 First version to compare
 * @param version2 Second version to compare
 * @returns Object containing the differences between versions
 */
export function compareVersions(
  version1: TemplateVersion,
  version2: TemplateVersion,
): Record<string, { before: any; after: any; changed: boolean }> {
  const fieldsToCompare = ["name", "description", "contractType", "responsibilities", "defaultDuration", "category"]

  const differences: Record<string, { before: any; after: any; changed: boolean }> = {}

  fieldsToCompare.forEach((field) => {
    const value1 = version1[field as keyof TemplateVersion]
    const value2 = version2[field as keyof TemplateVersion]
    const changed = value1 !== value2

    differences[field] = {
      before: value1,
      after: value2,
      changed,
    }
  })

  return differences
}

/**
 * Format a date string for display
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch (e) {
    return dateString
  }
}
