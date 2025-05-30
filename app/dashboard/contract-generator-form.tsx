"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { PlaceholderConfig, SelectOption, Template } from "@/types"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ContractGeneratorFormProps {
  templates: Template[]
}

type FormData = Record<string, string | number | undefined>

export default function ContractGeneratorForm({ templates }: ContractGeneratorFormProps) {
  const supabase = createClient()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<FormData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectOptions, setSelectOptions] = useState<Record<string, SelectOption[]>>({}) // Cache for dropdown options

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId)
      setCurrentTemplate(template || null)
      setFormData({}) // Reset form data when template changes
      if (template && template.placeholders_config) {
        fetchDropdownDataForTemplate(template.placeholders_config)
      }
    } else {
      setCurrentTemplate(null)
      setFormData({})
    }
  }, [selectedTemplateId, templates])

  const fetchDropdownDataForTemplate = async (placeholders: PlaceholderConfig[]) => {
    setIsLoading(true)
    const newSelectOptions: Record<string, SelectOption[]> = {}
    for (const ph of placeholders) {
      if (ph.type === "select" && ph.source_table && ph.source_value_column && ph.source_display_column) {
        if (selectOptions[ph.source_table]) {
          // Use cache if available
          newSelectOptions[ph.docx_tag] = selectOptions[ph.source_table]
          continue
        }

        const { data, error } = await supabase
          .from(ph.source_table)
          .select(`${ph.source_value_column}, ${ph.source_display_column}`)

        if (error) {
          toast({ title: `Error fetching data for ${ph.label}`, description: error.message, variant: "destructive" })
          continue
        }
        if (data) {
          const options = data.map((item: any) => ({
            value: item[ph.source_value_column!],
            label: item[ph.source_display_column!],
          }))
          newSelectOptions[ph.docx_tag] = options
          // Cache for future use if same table is needed
          if (!selectOptions[ph.source_table]) {
            setSelectOptions((prev) => ({ ...prev, [ph.source_table as string]: options }))
          }
        }
      }
    }
    setSelectOptions((prev) => ({ ...prev, ...newSelectOptions })) // Merge new options with existing (for different tags from same table)
    setIsLoading(false)
  }

  const handleInputChange = (tag: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [tag]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a contract template.",
        variant: "destructive",
      })
      return
    }
    setIsGenerating(true)

    // TODO: Validate form data against placeholder requirements (e.g. required fields)

    try {
      const response = await fetch("/api/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: currentTemplate.id,
          formData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate contract")
      }

      toast({
        title: "Contract Generated Successfully!",
        description: `File: ${result.fileName}. You can find it in the history tab.`,
      })
      // Optionally, trigger a download or redirect
      // window.open(result.downloadUrl, '_blank');
      setFormData({}) // Reset form after successful generation
      // Potentially refresh contract history list if it's on the same page or via global state
    } catch (error: any) {
      toast({ title: "Contract Generation Failed", description: error.message, variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const renderFormField = (placeholder: PlaceholderConfig) => {
    const fieldType = placeholder.type || (placeholder.source_table ? "select" : "text")
    const value = formData[placeholder.docx_tag] || ""

    switch (fieldType) {
      case "select":
        return (
          <div key={placeholder.docx_tag} className="grid gap-2">
            <Label htmlFor={placeholder.docx_tag}>{placeholder.label}</Label>
            <Select
              value={String(value)}
              onValueChange={(val) => handleInputChange(placeholder.docx_tag, val)}
              required={placeholder.required}
              disabled={isLoading}
            >
              <SelectTrigger id={placeholder.docx_tag}>
                <SelectValue placeholder={`Select ${placeholder.label}`} />
              </SelectTrigger>
              <SelectContent>
                {(selectOptions[placeholder.docx_tag] || []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      case "textarea":
        return (
          <div key={placeholder.docx_tag} className="grid gap-2">
            <Label htmlFor={placeholder.docx_tag}>{placeholder.label}</Label>
            <Textarea
              id={placeholder.docx_tag}
              value={String(value)}
              onChange={(e) => handleInputChange(placeholder.docx_tag, e.target.value)}
              placeholder={`Enter ${placeholder.label}`}
              required={placeholder.required}
              disabled={isLoading}
            />
          </div>
        )
      case "date":
        return (
          <div key={placeholder.docx_tag} className="grid gap-2">
            <Label htmlFor={placeholder.docx_tag}>{placeholder.label}</Label>
            <Input
              id={placeholder.docx_tag}
              type="date"
              value={String(value)}
              onChange={(e) => handleInputChange(placeholder.docx_tag, e.target.value)}
              required={placeholder.required}
              disabled={isLoading}
            />
          </div>
        )
      case "number":
        return (
          <div key={placeholder.docx_tag} className="grid gap-2">
            <Label htmlFor={placeholder.docx_tag}>{placeholder.label}</Label>
            <Input
              id={placeholder.docx_tag}
              type="number"
              value={String(value)}
              onChange={(e) => handleInputChange(placeholder.docx_tag, e.target.valueAsNumber)}
              placeholder={`Enter ${placeholder.label}`}
              required={placeholder.required}
              disabled={isLoading}
            />
          </div>
        )
      case "text":
      default:
        return (
          <div key={placeholder.docx_tag} className="grid gap-2">
            <Label htmlFor={placeholder.docx_tag}>{placeholder.label}</Label>
            <Input
              id={placeholder.docx_tag}
              type="text"
              value={String(value)}
              onChange={(e) => handleInputChange(placeholder.docx_tag, e.target.value)}
              placeholder={`Enter ${placeholder.label}`}
              required={placeholder.required}
              disabled={isLoading}
            />
          </div>
        )
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate New Contract</CardTitle>
        <CardDescription>Select a template and fill in the details to generate a new contract.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="template-select">Contract Template</Label>
            <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId} disabled={isGenerating}>
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2">Loading form fields...</p>
            </div>
          )}

          {currentTemplate && currentTemplate.placeholders_config && !isLoading && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Fill Contract Details</h3>
              {currentTemplate.placeholders_config.map(renderFormField)}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full sm:w-auto" disabled={!currentTemplate || isLoading || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Contract"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
