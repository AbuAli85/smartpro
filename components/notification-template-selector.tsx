"use client"

import { useState, useEffect } from "react"
import { Bell, Search, AlertCircle, CheckCircle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useNotifications } from "@/contexts/notification-context"
import { getTranslations } from "@/utils/translations"
import { notificationTemplates } from "@/utils/notification-templates"
import NotificationExpirationForm from "./notification-expiration-form"

interface NotificationTemplateSelectorProps {
  language: "en" | "ar"
  onClose?: () => void
  defaultCategory?: string
}

export default function NotificationTemplateSelector({
  language,
  onClose,
  defaultCategory = "all",
}: NotificationTemplateSelectorProps) {
  const t = getTranslations(language)
  const { addNotificationFromTemplate } = useNotifications()

  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(defaultCategory)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({})
  const [expirationDate, setExpirationDate] = useState<string | undefined>(undefined)
  const [isImportant, setIsImportant] = useState(false)
  const [requiresReadReceipt, setRequiresReadReceipt] = useState(false)
  const [previewMessage, setPreviewMessage] = useState("")

  // Filter templates based on active tab and search query
  const filteredTemplates = notificationTemplates.filter((template) => {
    const matchesCategory = activeTab === "all" || template.category === activeTab
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Get the selected template object
  const selectedTemplateObj = selectedTemplate ? notificationTemplates.find((t) => t.id === selectedTemplate) : null

  // Update preview message when template or params change
  useEffect(() => {
    if (selectedTemplateObj) {
      let message = selectedTemplateObj.messageTemplate
      for (const [key, value] of Object.entries(templateParams)) {
        message = message.replace(new RegExp(`{${key}}`, "g"), value || "")
      }
      setPreviewMessage(message)

      // Set default values for important and read receipt
      setIsImportant(selectedTemplateObj.defaultImportant)
      setRequiresReadReceipt(selectedTemplateObj.defaultRequiresReadReceipt)

      // Set default expiration if available
      if (selectedTemplateObj.defaultExpirationHours) {
        const expirationDate = new Date()
        expirationDate.setHours(expirationDate.getHours() + selectedTemplateObj.defaultExpirationHours)
        setExpirationDate(expirationDate.toISOString())
      } else {
        setExpirationDate(undefined)
      }
    } else {
      setPreviewMessage("")
    }
  }, [selectedTemplate, templateParams])

  // Reset form when dialog is opened
  useEffect(() => {
    if (open) {
      setSelectedTemplate(null)
      setTemplateParams({})
      setExpirationDate(undefined)
      setIsImportant(false)
      setRequiresReadReceipt(false)
      setPreviewMessage("")
    }
  }, [open])

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setTemplateParams({})
  }

  // Handle parameter change
  const handleParamChange = (paramName: string, value: string) => {
    setTemplateParams((prev) => ({
      ...prev,
      [paramName]: value,
    }))
  }

  // Handle notification creation
  const handleCreateNotification = () => {
    if (!selectedTemplate) return

    addNotificationFromTemplate(selectedTemplate, templateParams, {
      important: isImportant,
      requiresReadReceipt,
      expiresAt: expirationDate,
    })

    setOpen(false)
    if (onClose) onClose()
  }

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Bell className="h-4 w-4" />
          <span>{t.createNotification}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t.createNotificationFromTemplate}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Template selection panel */}
          <div className="w-1/3 border-r pr-4 overflow-y-auto">
            <div className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchTemplates}
                  className="pl-8"
                />
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="all">{t.all}</TabsTrigger>
                <TabsTrigger value="approval">{t.approval}</TabsTrigger>
                <TabsTrigger value="contract">{t.contract}</TabsTrigger>
              </TabsList>
              <TabsList className="w-full grid grid-cols-2 mt-1">
                <TabsTrigger value="system">{t.system}</TabsTrigger>
                <TabsTrigger value="general">{t.general}</TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-2">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">{t.noTemplatesFound}</div>
                ) : (
                  filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-md cursor-pointer hover:border-blue-500 transition-colors ${
                        selectedTemplate === template.id ? "border-blue-500 bg-blue-50" : ""
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getNotificationIcon(template.type)}</div>
                        <div>
                          <h3 className="font-medium text-sm">{template.name}</h3>
                          <p className="text-xs text-gray-500">{template.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tabs>
          </div>

          {/* Template configuration panel */}
          <div className="w-2/3 pl-4 overflow-y-auto">
            {selectedTemplateObj ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium">{selectedTemplateObj.name}</h3>
                  <p className="text-sm text-gray-500">{selectedTemplateObj.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={`${
                        selectedTemplateObj.type === "info"
                          ? "bg-blue-50 text-blue-800 border-blue-300"
                          : selectedTemplateObj.type === "success"
                            ? "bg-green-50 text-green-800 border-green-300"
                            : selectedTemplateObj.type === "warning"
                              ? "bg-yellow-50 text-yellow-800 border-yellow-300"
                              : "bg-red-50 text-red-800 border-red-300"
                      }`}
                    >
                      {selectedTemplateObj.type}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-300">
                      {selectedTemplateObj.category}
                    </Badge>
                  </div>
                </div>

                {/* Template parameters */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">{t.parameters}</h3>
                  {selectedTemplateObj.parameters.map((param) => (
                    <div key={param} className="space-y-1">
                      <Label htmlFor={param}>{param}</Label>
                      <Input
                        id={param}
                        value={templateParams[param] || ""}
                        onChange={(e) => handleParamChange(param, e.target.value)}
                        placeholder={`Enter ${param}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">{t.preview}</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getNotificationIcon(selectedTemplateObj.type)}</div>
                      <p className="text-sm">{previewMessage}</p>
                    </div>
                  </div>
                </div>

                {/* Notification options */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">{t.notificationOptions}</h3>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="important">{t.markAsImportant}</Label>
                    <Switch id="important" checked={isImportant} onCheckedChange={setIsImportant} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="read-receipt">{t.requireReadReceipt}</Label>
                    <Switch id="read-receipt" checked={requiresReadReceipt} onCheckedChange={setRequiresReadReceipt} />
                  </div>
                </div>

                {/* Expiration settings */}
                <NotificationExpirationForm
                  language={language}
                  onExpirationSet={setExpirationDate}
                  initialExpiration={expirationDate}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t.selectTemplateFromList}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t.cancel}
          </Button>
          <Button
            onClick={handleCreateNotification}
            disabled={!selectedTemplate || Object.keys(templateParams).length === 0}
          >
            {t.createNotification}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
