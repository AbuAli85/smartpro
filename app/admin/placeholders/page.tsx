"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { edgeFunctions } from "@/app/lib/edge-function-client"

// Define the placeholder types
interface FormPlaceholder {
  id: number
  form_type: string
  title: string
  title_ar: string
  first_party_label: string
  first_party_label_ar: string
  second_party_label: string
  second_party_label_ar: string
  promoter_label: string
  promoter_label_ar: string
  product_location_label: string
  product_location_label_ar: string
  contract_period_label: string
  contract_period_label_ar: string
  template_label: string
  template_label_ar: string
  documents_label: string
  documents_label_ar: string
  created_at: string
  updated_at: string
}

export default function PlaceholdersPage() {
  const router = useRouter()
  const [placeholders, setPlaceholders] = useState<FormPlaceholder[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeFormType, setActiveFormType] = useState<string>("contract_form")
  const [formData, setFormData] = useState<Partial<FormPlaceholder>>({})
  const [error, setError] = useState<string | null>(null)

  // Fetch placeholders using Edge Function
  useEffect(() => {
    async function fetchPlaceholders() {
      try {
        setLoading(true)
        setError(null)

        // Get all form types
        const data = await edgeFunctions.callEdgeFunction("get-all-form-placeholders")

        if (data && data.length > 0) {
          setPlaceholders(data)
          setActiveFormType(data[0].form_type)
          setFormData(data[0])
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchPlaceholders()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission using Edge Function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      await edgeFunctions.contract.updateFormPlaceholders(activeFormType, formData)

      toast({
        title: "Changes saved",
        description: "Form placeholders have been updated successfully.",
      })

      // Refresh the placeholders list
      const refreshedData = await edgeFunctions.callEdgeFunction("get-all-form-placeholders")
      if (refreshedData) {
        setPlaceholders(refreshedData)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveFormType(value)
    const selectedForm = placeholders.find((p) => p.form_type === value)
    if (selectedForm) {
      setFormData(selectedForm)
    }
  }

  // Create a new form type using Edge Function
  const handleCreateNew = async () => {
    const formType = prompt("Enter a new form type identifier (e.g., 'approval_form'):")

    if (!formType) return

    try {
      setSaving(true)

      const newPlaceholders = {
        form_type: formType,
        title: "New Form",
        title_ar: "نموذج جديد",
        first_party_label: "First Party",
        first_party_label_ar: "الطرف الأول",
        second_party_label: "Second Party",
        second_party_label_ar: "الطرف الثاني",
        promoter_label: "Promoter",
        promoter_label_ar: "المروج",
        product_location_label: "Product & Location",
        product_location_label_ar: "المنتج والموقع",
        contract_period_label: "Period",
        contract_period_label_ar: "المدة",
        template_label: "Template",
        template_label_ar: "النموذج",
        documents_label: "Documents",
        documents_label_ar: "المستندات",
      }

      await edgeFunctions.contract.createFormPlaceholders(formType, newPlaceholders)

      toast({
        title: "Form type created",
        description: `New form type "${formType}" has been created.`,
      })

      // Refresh the placeholders list
      const refreshedData = await edgeFunctions.callEdgeFunction("get-all-form-placeholders")
      if (refreshedData) {
        setPlaceholders(refreshedData)
        setActiveFormType(formType)
        const newForm = refreshedData.find((p: any) => p.form_type === formType)
        if (newForm) {
          setFormData(newForm)
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Rest of the component remains the same
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading placeholders...</span>
      </div>
    )
  }

  // Rest of the component remains the same
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Form Placeholders Admin</h1>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">Manage form labels and placeholders for different form types.</p>
          <Button onClick={handleCreateNew} disabled={saving}>
            Add New Form Type
          </Button>
        </div>

        {placeholders.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Form Types Found</CardTitle>
              <CardDescription>
                No form placeholders have been created yet. Click the button above to create your first form type.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Tabs value={activeFormType} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              {placeholders.map((p) => (
                <TabsTrigger key={p.form_type} value={p.form_type}>
                  {p.form_type}
                </TabsTrigger>
              ))}
            </TabsList>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Edit {activeFormType} Placeholders</CardTitle>
                  <CardDescription>These placeholders will be used in the {activeFormType} form.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Form Title (English)</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title || ""}
                      onChange={handleInputChange}
                      placeholder="Form Title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title_ar">Form Title (Arabic)</Label>
                    <Input
                      id="title_ar"
                      name="title_ar"
                      value={formData.title_ar || ""}
                      onChange={handleInputChange}
                      placeholder="عنوان النموذج"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_party_label">First Party Section (English)</Label>
                      <Input
                        id="first_party_label"
                        name="first_party_label"
                        value={formData.first_party_label || ""}
                        onChange={handleInputChange}
                        placeholder="First Party Section"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="first_party_label_ar">First Party Section (Arabic)</Label>
                      <Input
                        id="first_party_label_ar"
                        name="first_party_label_ar"
                        value={formData.first_party_label_ar || ""}
                        onChange={handleInputChange}
                        placeholder="قسم الطرف الأول"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="second_party_label">Second Party Section (English)</Label>
                      <Input
                        id="second_party_label"
                        name="second_party_label"
                        value={formData.second_party_label || ""}
                        onChange={handleInputChange}
                        placeholder="Second Party Section"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="second_party_label_ar">Second Party Section (Arabic)</Label>
                      <Input
                        id="second_party_label_ar"
                        name="second_party_label_ar"
                        value={formData.second_party_label_ar || ""}
                        onChange={handleInputChange}
                        placeholder="قسم الطرف الثاني"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="promoter_label">Promoter Section (English)</Label>
                      <Input
                        id="promoter_label"
                        name="promoter_label"
                        value={formData.promoter_label || ""}
                        onChange={handleInputChange}
                        placeholder="Promoter Section"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="promoter_label_ar">Promoter Section (Arabic)</Label>
                      <Input
                        id="promoter_label_ar"
                        name="promoter_label_ar"
                        value={formData.promoter_label_ar || ""}
                        onChange={handleInputChange}
                        placeholder="قسم المروج"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product_location_label">Product & Location Section (English)</Label>
                      <Input
                        id="product_location_label"
                        name="product_location_label"
                        value={formData.product_location_label || ""}
                        onChange={handleInputChange}
                        placeholder="Product & Location Section"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product_location_label_ar">Product & Location Section (Arabic)</Label>
                      <Input
                        id="product_location_label_ar"
                        name="product_location_label_ar"
                        value={formData.product_location_label_ar || ""}
                        onChange={handleInputChange}
                        placeholder="قسم المنتج والموقع"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contract_period_label">Contract Period Section (English)</Label>
                      <Input
                        id="contract_period_label"
                        name="contract_period_label"
                        value={formData.contract_period_label || ""}
                        onChange={handleInputChange}
                        placeholder="Contract Period Section"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contract_period_label_ar">Contract Period Section (Arabic)</Label>
                      <Input
                        id="contract_period_label_ar"
                        name="contract_period_label_ar"
                        value={formData.contract_period_label_ar || ""}
                        onChange={handleInputChange}
                        placeholder="قسم مدة العقد"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template_label">Template Section (English)</Label>
                      <Input
                        id="template_label"
                        name="template_label"
                        value={formData.template_label || ""}
                        onChange={handleInputChange}
                        placeholder="Template Section"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template_label_ar">Template Section (Arabic)</Label>
                      <Input
                        id="template_label_ar"
                        name="template_label_ar"
                        value={formData.template_label_ar || ""}
                        onChange={handleInputChange}
                        placeholder="قسم النموذج"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documents_label">Documents Section (English)</Label>
                      <Input
                        id="documents_label"
                        name="documents_label"
                        value={formData.documents_label || ""}
                        onChange={handleInputChange}
                        placeholder="Documents Section"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documents_label_ar">Documents Section (Arabic)</Label>
                      <Input
                        id="documents_label_ar"
                        name="documents_label_ar"
                        value={formData.documents_label_ar || ""}
                        onChange={handleInputChange}
                        placeholder="قسم المستندات"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => router.push("/admin")}>
                    Back to Admin
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Tabs>
        )}
      </div>
    </div>
  )
}
