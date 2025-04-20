"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Save, LayoutTemplateIcon as Template, Trash2, FileText, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { templateService, type Template as TemplateType } from "@/services/template-service"
import { getTranslations } from "@/utils/translations"
import { useToast } from "@/hooks/use-toast"
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription"

interface TemplateSelectorProps {
  language: "en" | "ar"
  onSelectTemplate: (templateId: string) => void
  userId: string
  showOnlyPublished?: boolean
}

export default function TemplateSelector({
  language,
  onSelectTemplate,
  userId,
  showOnlyPublished = false,
}: TemplateSelectorProps) {
  const t = getTranslations(language)
  const { toast } = useToast()
  const [templates, setTemplates] = useState<TemplateType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateDescription, setNewTemplateDescription] = useState("")
  const [newTemplateDuration, setNewTemplateDuration] = useState(30)
  const [newTemplateCategory, setNewTemplateCategory] = useState("general")

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true)
      try {
        let data: TemplateType[] = []

        if (showOnlyPublished) {
          const result = await templateService.getPublishedTemplates()
          data = result.data || []
        } else {
          const result = await templateService.getUserTemplates(userId)
          data = result.data || []
        }

        setTemplates(data)
      } catch (error) {
        console.error("Error loading templates:", error)
        toast({
          title: t.error,
          description: t.errorLoadingTemplates,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadTemplates()
    }
  }, [userId, showOnlyPublished, t, toast])

  // Subscribe to real-time template updates
  const handleRealtimeTemplate = (payload: { new: TemplateType; old: TemplateType | null }) => {
    const newTemplate = payload.new

    if (payload.old) {
      // Update existing template
      setTemplates((prev) => prev.map((t) => (t.id === newTemplate.id ? newTemplate : t)))
    } else {
      // Add new template
      setTemplates((prev) => [newTemplate, ...prev])
    }
  }

  // Set up real-time subscription
  useRealtimeSubscription<TemplateType>(
    "templates",
    "*",
    handleRealtimeTemplate,
    showOnlyPublished ? { column: "is_published", value: "true" } : { column: "user_id", value: userId },
  )

  // Filter templates based on search and categories
  const filteredTemplates = templates.filter((template) => {
    // Filter by category if categories are selected
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(template.category)

    // Filter by search query
    const searchMatch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.responsibilities.toLowerCase().includes(searchQuery.toLowerCase())

    return categoryMatch && searchMatch
  })

  // Handle saving a new template
  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim() || !userId) return

    try {
      await templateService.createTemplate({
        user_id: userId,
        name: newTemplateName,
        description: newTemplateDescription,
        contract_type: "Assignment", // Default value, should be from current form
        responsibilities: "Default responsibilities", // Should be from current form
        default_duration: newTemplateDuration,
        category: newTemplateCategory,
        created_by: userId,
        approval_status: "draft",
        is_published: false,
        is_default: false,
      })

      toast({
        title: t.success,
        description: t.templateSaved,
      })

      // Reset form
      setSaveDialogOpen(false)
      setNewTemplateName("")
      setNewTemplateDescription("")
      setNewTemplateDuration(30)
      setNewTemplateCategory("general")
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: t.error,
        description: t.errorSavingTemplate,
        variant: "destructive",
      })
    }
  }

  // Handle deleting a template
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await templateService.deleteTemplate(templateId)

      // Update local state
      setTemplates((prev) => prev.filter((t) => t.id !== templateId))

      toast({
        title: t.success,
        description: t.templateDeleted,
      })
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: t.error,
        description: t.errorDeletingTemplate,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t.templates}</h3>
        {!showOnlyPublished && (
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Save className="h-4 w-4" />
                <span>{t.saveAsTemplate}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.saveAsTemplate}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.templateName}</label>
                  <Input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder={t.enterTemplateName}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.templateDescription}</label>
                  <Input
                    type="text"
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder={t.enterTemplateDescription}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.defaultDuration}</label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={newTemplateDuration}
                    onChange={(e) => setNewTemplateDuration(Number.parseInt(e.target.value) || 30)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.category}</label>
                  <select
                    value={newTemplateCategory}
                    onChange={(e) => setNewTemplateCategory(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="general">{t.categoryNames?.general || "General"}</option>
                    <option value="employment">{t.categoryNames?.employment || "Employment"}</option>
                    <option value="services">{t.categoryNames?.services || "Services"}</option>
                    <option value="consulting">{t.categoryNames?.consulting || "Consulting"}</option>
                    <option value="legal">{t.categoryNames?.legal || "Legal"}</option>
                    <option value="financial">{t.categoryNames?.financial || "Financial"}</option>
                    <option value="real-estate">{t.categoryNames?.["real-estate"] || "Real Estate"}</option>
                    <option value="other">{t.categoryNames?.other || "Other"}</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSaveTemplate} disabled={!newTemplateName.trim()}>
                    {t.saveTemplate}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchTemplates}
            className="pl-8"
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
        </div>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>{t.filterByCategory}</span>
          {selectedCategories.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
              {selectedCategories.length}
            </span>
          )}
        </Button>
      </div>

      {/* Templates grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-40">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">{t.noTemplatesFound}</p>
            <p className="text-sm text-gray-400 mt-1">{t.tryDifferentFilters}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create New Template Card */}
          {!showOnlyPublished && (
            <div
              className="border rounded-lg p-4 flex flex-col items-center justify-center h-40 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onSelectTemplate("blank")}
            >
              <PlusCircle className="h-10 w-10 text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">{t.blankContract}</p>
              <p className="text-sm text-gray-500">{t.startFromScratch}</p>
            </div>
          )}

          {/* Template Cards */}
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 flex flex-col h-40 hover:border-blue-500 cursor-pointer transition-colors relative"
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">{template.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-1">{template.description}</p>
                </div>
                <Template className="h-5 w-5 text-blue-500 flex-shrink-0" />
              </div>
              <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-1">
                <span className="inline-flex items-center gap-1 bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                  <FileText className="h-3 w-3" />
                  <span>
                    {t.categoryNames?.[template.category as keyof typeof t.categoryNames] || template.category}
                  </span>
                </span>

                <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                  {t.contractTypeOptions[template.contract_type.toLowerCase() as keyof typeof t.contractTypeOptions] ||
                    template.contract_type}
                </span>

                {template.default_duration && (
                  <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                    {template.default_duration} {t.days}
                  </span>
                )}
              </div>

              <div className="mt-auto">
                <p className="text-xs text-gray-500 line-clamp-2">{template.responsibilities.substring(0, 100)}...</p>
              </div>

              {/* Template actions */}
              {!showOnlyPublished && (
                <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">{t.deleteTemplate}</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
