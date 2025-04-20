"use client"

import type React from "react"

import { useState } from "react"
import { Share2, Download, Upload, Copy, Check, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTranslations } from "@/utils/translations"
import type { ContractTemplate } from "@/types/template"
import { validateImportedTemplate } from "@/utils/template-storage"

interface TemplateSharingProps {
  language: "en" | "ar"
  template: ContractTemplate
  onImportTemplate: (template: ContractTemplate) => void
}

export default function TemplateSharing({ language, template, onImportTemplate }: TemplateSharingProps) {
  const t = getTranslations(language)
  const [copied, setCopied] = useState(false)
  const [importText, setImportText] = useState("")
  const [importError, setImportError] = useState("")
  const [importSuccess, setImportSuccess] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Generate template export string
  const exportString = JSON.stringify(template, null, 2)

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(exportString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle download template as JSON file
  const handleDownload = () => {
    const blob = new Blob([exportString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${template.name.toLowerCase().replace(/\s+/g, "-")}-template.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle import from text
  const handleImport = () => {
    setImportError("")
    setImportSuccess(false)

    try {
      // Parse the JSON
      const importedTemplate = JSON.parse(importText)

      // Validate the template
      const validationResult = validateImportedTemplate(importedTemplate)

      if (validationResult.valid) {
        // Generate a new ID to avoid conflicts
        const templateWithNewId = {
          ...importedTemplate,
          id: `imported-${Date.now()}`,
          isCustom: true,
          importedAt: new Date().toISOString(),
        }

        // Pass the template to the parent component
        onImportTemplate(templateWithNewId)
        setImportSuccess(true)
        setImportText("")

        // Close dialog after a delay
        setTimeout(() => {
          setDialogOpen(false)
        }, 1500)
      } else {
        setImportError(validationResult.error || t.invalidTemplate)
      }
    } catch (error) {
      setImportError(t.invalidJSON)
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImportText(event.target.result as string)
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          <span>{t.shareTemplate}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.shareTemplate}</DialogTitle>
          <DialogDescription>{t.shareTemplateDescription}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">{t.export}</TabsTrigger>
            <TabsTrigger value="import">{t.import}</TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.exportTemplate}</label>
              <div className="relative">
                <textarea
                  readOnly
                  value={exportString}
                  className="w-full h-40 p-3 border rounded-md font-mono text-sm bg-gray-50"
                />
                <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleDownload} className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                {t.downloadTemplate}
              </Button>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.importTemplate}</label>
              <div className="border-2 border-dashed rounded-md p-4 text-center">
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" id="template-file" />
                <label htmlFor="template-file" className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium">{t.uploadTemplateFile}</span>
                  <span className="text-xs text-gray-500 mt-1">{t.dragDropOrClick}</span>
                </label>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">{t.orPasteJSON}</label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full h-40 p-3 border rounded-md font-mono text-sm mt-1"
                  placeholder={t.pasteTemplateJSON}
                />
              </div>

              {importError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <Check className="h-4 w-4" />
                  <span>{t.templateImportedSuccessfully}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleImport} disabled={!importText.trim()} className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                {t.importTemplate}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
