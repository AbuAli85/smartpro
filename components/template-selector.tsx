"use client"

import type React from "react"

import { useState } from "react"
import {
  PlusCircle,
  Save,
  LayoutTemplateIcon as Template,
  Trash2,
  FileText,
  Briefcase,
  Wrench,
  Users,
  Scale,
  DollarSign,
  Home,
  MoreHorizontal,
  History,
} from "lucide-react"
import { type ContractTemplate, predefinedTemplates, templateCategories, ApprovalStatus } from "@/types/template"
import { getTranslations } from "@/utils/translations"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import TemplateSharing from "./template-sharing"
import CategoryFilter from "./category-filter"
import VersionHistoryDialog from "./version-history-dialog"
import { updateTemplateWithVersion } from "@/utils/template-storage"
import { useUser } from "@/contexts/user-context"
import ApprovalStatusBadge from "./approval-status-badge"
import ApprovalRequestDialog from "./approval-request-dialog"
import ApprovalManagementDialog from "./approval-management-dialog"

interface TemplateSelectorProps {
  language: "en" | "ar"
  onSelectTemplate: (template: ContractTemplate) => void
  onSaveTemplate: (template: ContractTemplate) => void
  onUpdateTemplate: (template: ContractTemplate) => void
  onDeleteTemplate?: (templateId: string) => void
  onImportTemplate: (template: ContractTemplate) => void
  currentValues: {
    contractType: string
    responsibilities: string
  }
  customTemplates: ContractTemplate[]
  currentUser?: string
  showOnlyPublished?: boolean
}

// Map of category icons
const categoryIcons: Record<string, React.ReactNode> = {
  general: <FileText className="h-4 w-4" />,
  employment: <Briefcase className="h-4 w-4" />,
  services: <Wrench className="h-4 w-4" />,
  consulting: <Users className="h-4 w-4" />,
  legal: <Scale className="h-4 w-4" />,
  financial: <DollarSign className="h-4 w-4" />,
  "real-estate": <Home className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
}

export default function TemplateSelector({
  language,
  onSelectTemplate,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onImportTemplate,
  currentValues,
  customTemplates = [],
  currentUser = "Current User",
  showOnlyPublished = false,
}: TemplateSelectorProps) {
  const t = getTranslations(language)
  const { currentUser: user, isApprover } = useUser()
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateDescription, setNewTemplateDescription] = useState("")
  const [newTemplateDuration, setNewTemplateDuration] = useState(30)
  const [newTemplateCategory, setNewTemplateCategory] = useState("general")
  const [changeNotes, setChangeNotes] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null)

  // Combine predefined and custom templates
  let allTemplates = [...predefinedTemplates, ...customTemplates]

  // Filter published templates if needed
  if (showOnlyPublished) {
    allTemplates = allTemplates.filter((t) => t.isPublished && t.approvalStatus === ApprovalStatus.Approved)
  }

  // Filter templates by category and search query
  const filteredTemplates = allTemplates.filter((template) => {
    // Filter by category if categories are selected
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(template.category)

    // Filter by search query
    const searchMatch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    return categoryMatch && searchMatch
  })

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return

    if (editingTemplate) {
      // Update existing template with version tracking
      const updatedTemplate = {
        ...editingTemplate,
        name: newTemplateName,
        description: newTemplateDescription,
        contractType: currentValues.contractType,
        responsibilities: currentValues.responsibilities,
        defaultDuration: newTemplateDuration,
        category: newTemplateCategory,
      }

      const versionedTemplate = updateTemplateWithVersion(updatedTemplate, changeNotes, user?.name || currentUser)
      onUpdateTemplate(versionedTemplate)
    } else {
      // Create new template
      const newTemplate: ContractTemplate = {
        id: `custom-${Date.now()}`,
        name: newTemplateName,
        description: newTemplateDescription,
        contractType: currentValues.contractType,
        responsibilities: currentValues.responsibilities,
        defaultDuration: newTemplateDuration,
        category: newTemplateCategory,
        version: 1,
        versionHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.name || currentUser,
        lastModifiedBy: user?.name || currentUser,
        approvalStatus: ApprovalStatus.Draft,
        isPublished: false,
      }

      onSaveTemplate(newTemplate)
    }

    // Reset form
    setSaveDialogOpen(false)
    setNewTemplateName("")
    setNewTemplateDescription("")
    setNewTemplateDuration(30)
    setNewTemplateCategory("general")
    setChangeNotes("")
    setEditingTemplate(null)
  }

  const handleEditTemplate = (template: ContractTemplate) => {
    setEditingTemplate(template)
    setNewTemplateName(template.name)
    setNewTemplateDescription(template.description || "")
    setNewTemplateDuration(template.defaultDuration || 30)
    setNewTemplateCategory(template.category || "general")
    setChangeNotes("")
    setSaveDialogOpen(true)
  }

  return (
    <div className={`mb-6 ${language === "ar" ? "rtl" : "ltr"}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t.templates || "Templates"}</h3>
        <div className="flex gap-2">
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  setEditingTemplate(null)
                  setNewTemplateName("")
                  setNewTemplateDescription("")
                  setNewTemplateDuration(30)
                  setNewTemplateCategory("general")
                  setChangeNotes("")
                }}
              >
                <Save className="h-4 w-4" />
                <span>{t.saveAsTemplate || "Save as Template"}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? t.updateTemplate || "Update Template" : t.saveAsTemplate || "Save as Template"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.templateName || "Template Name"}</label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder={t.enterTemplateName || "Enter template name"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.templateDescription || "Description (Optional)"}</label>
                  <textarea
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    className="w-full p-2 border rounded-md h-24"
                    placeholder={t.enterTemplateDescription || "Enter template description"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.defaultDuration || "Default Duration (days)"}</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newTemplateDuration}
                    onChange={(e) => setNewTemplateDuration(Number.parseInt(e.target.value) || 30)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.category || "Category"}</label>
                  <select
                    value={newTemplateCategory}
                    onChange={(e) => setNewTemplateCategory(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {templateCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {t.categoryNames?.[category.id as keyof typeof t.categoryNames] || category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {editingTemplate && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t.changeNotes || "Change Notes (Optional)"}</label>
                    <textarea
                      value={changeNotes}
                      onChange={(e) => setChangeNotes(e.target.value)}
                      className="w-full p-2 border rounded-md h-24"
                      placeholder={t.enterChangeNotes || "Describe what changed in this version"}
                    />
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveTemplate} disabled={!newTemplateName.trim()}>
                    {editingTemplate ? t.updateTemplate || "Update Template" : t.saveTemplate || "Save Template"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchTemplates || "Search templates..."}
            className="w-full p-2 pl-8 border rounded-md"
          />
          <svg
            className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">{t.clear}</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <CategoryFilter
          language={language}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
        />
      </div>

      {/* No results message */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MoreHorizontal className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">{t.noTemplatesFound || "No templates found"}</p>
          <p className="text-sm text-gray-400 mt-1">
            {t.tryDifferentFilters || "Try different search terms or filters"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create New Template Card */}
        {!showOnlyPublished && (
          <div
            className="border rounded-lg p-4 flex flex-col items-center justify-center h-40 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() =>
              onSelectTemplate({
                id: "blank",
                name: "Blank Contract",
                description: "",
                contractType: "",
                responsibilities: "",
                category: "general",
                version: 1,
                approvalStatus: ApprovalStatus.Draft,
                isPublished: false,
              })
            }
          >
            <PlusCircle className="h-10 w-10 text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">{t.blankContract || "Blank Contract"}</p>
            <p className="text-sm text-gray-500">{t.startFromScratch || "Start from scratch"}</p>
          </div>
        )}

        {/* Template Cards */}
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg p-4 flex flex-col h-40 hover:border-blue-500 cursor-pointer transition-colors relative"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-800">{template.name}</h4>
                <p className="text-sm text-gray-500 line-clamp-1">{template.description}</p>
              </div>
              <Template className="h-5 w-5 text-blue-500 flex-shrink-0" />
            </div>
            <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-1">
              {/* Category badge */}
              <span className="inline-flex items-center gap-1 bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                {categoryIcons[template.category] || <FileText className="h-3 w-3" />}
                <span>
                  {t.categoryNames?.[template.category as keyof typeof t.categoryNames] ||
                    templateCategories.find((c) => c.id === template.category)?.name ||
                    "General"}
                </span>
              </span>

              <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                {t.contractTypeOptions[template.contractType.toLowerCase() as keyof typeof t.contractTypeOptions] ||
                  template.contractType}
              </span>

              {template.defaultDuration && (
                <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                  {template.defaultDuration} {t.days || "days"}
                </span>
              )}

              {template.isCustom && (
                <span className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-1 mr-1 mb-1">
                  {t.custom || "Custom"}
                </span>
              )}

              {template.importedAt && (
                <span className="inline-block bg-purple-100 text-purple-800 rounded px-2 py-1 mr-1 mb-1">
                  {t.imported || "Imported"}
                </span>
              )}

              {/* Version badge */}
              {template.version > 1 && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 rounded px-2 py-1 mr-1 mb-1">
                  <History className="h-3 w-3" />
                  <span>v{template.version}</span>
                </span>
              )}

              {/* Approval status badge */}
              <ApprovalStatusBadge
                status={template.approvalStatus}
                language={language}
                isPublished={template.isPublished}
              />
            </div>

            <div className="mt-auto">
              <p className="text-xs text-gray-500 line-clamp-2">{template.responsibilities.substring(0, 100)}...</p>
            </div>

            {/* Template actions */}
            {template.isCustom && (
              <div className="absolute top-2 right-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                {/* Version History */}
                {template.version && (
                  <VersionHistoryDialog language={language} template={template} onRestoreVersion={onUpdateTemplate} />
                )}

                {/* Template Sharing */}
                <TemplateSharing language={language} template={template} onImportTemplate={onImportTemplate} />

                {/* Approval Request */}
                <ApprovalRequestDialog language={language} template={template} onRequestSubmitted={onUpdateTemplate} />

                {/* Approval Management */}
                <ApprovalManagementDialog language={language} template={template} onApprovalAction={onUpdateTemplate} />

                {/* Edit Template */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditTemplate(template)
                  }}
                  disabled={template.approvalStatus === ApprovalStatus.PendingApproval}
                >
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <span className="sr-only">{t.editTemplate}</span>
                </Button>

                {/* Delete Template */}
                {onDeleteTemplate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteTemplate(template.id)
                    }}
                    disabled={template.approvalStatus === ApprovalStatus.PendingApproval}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">{t.deleteTemplate}</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
