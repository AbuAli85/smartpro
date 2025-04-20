"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ContractPreviewModal from "./contract-preview-modal"
import LanguageToggle from "./language-toggle"
import SignaturePad from "./signature-pad"
import MultiStepForm from "./multi-step-form"
import TemplateSelector from "./template-selector"
import { getTranslations } from "@/utils/translations"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"
import { templateService } from "@/services/template-service"
import { contractService } from "@/services/contract-service"
import { storageService } from "@/services/storage-service"
import { generateContractPDF } from "@/utils/pdf-generator"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type Language = "en" | "ar"

// Create a function to get the schema with translations
function getContractSchema(t: any) {
  return z.object({
    contractType: z.string().nonempty(t.required),
    firstPartyName: z.string().nonempty(t.required),
    secondPartyName: z.string().nonempty(t.required),
    startDate: z.string().nonempty(t.startDateRequired),
    endDate: z.string().nonempty(t.endDateRequired),
    responsibilities: z.string().nonempty(t.responsibilitiesRequired),
    signature: z.string().nonempty(t.signatureRequired),
    stamp: z.string().optional(),
  })
}

export default function ContractForm() {
  const [language, setLanguage] = useState<Language>("en")
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [showTemplates, setShowTemplates] = useState(true)
  const [activeTab, setActiveTab] = useState("create")
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { toast } = useToast()
  const router = useRouter()
  const [stampPreview, setStampPreview] = useState<string | null>(null)

  // Get translations based on selected language
  const t = getTranslations(language)

  // Create schema with current language translations
  const contractSchema = getContractSchema(t)
  type FormData = z.infer<typeof contractSchema>

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset,
    trigger,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(contractSchema),
    mode: "onChange",
  })

  // Watch the signature value for validation
  const signatureValue = watch("signature")
  const contractType = watch("contractType")
  const responsibilities = watch("responsibilities")

  // Define steps for the multi-step form
  const steps = [
    {
      id: "step-1",
      title: t.step1Title,
      description: t.step1Description,
    },
    {
      id: "step-2",
      title: t.step2Title,
      description: t.step2Description,
    },
    {
      id: "step-3",
      title: t.step3Title,
      description: t.step3Description,
    },
    {
      id: "step-4",
      title: t.step4Title,
      description: t.step4Description,
    },
  ]

  const generateReferenceNumber = () => {
    return `PRM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`
  }

  const handleStepChange = async (step: number) => {
    // Validate current step before proceeding
    let isValid = true

    if (step > currentStep) {
      // Validate specific fields based on current step
      if (currentStep === 0) {
        // Validate parties step
        isValid = await trigger(["firstPartyName", "secondPartyName"])
      } else if (currentStep === 1) {
        // Validate contract details step
        isValid = await trigger(["contractType", "startDate", "endDate", "responsibilities"])
      } else if (currentStep === 2) {
        // Validate signatures step
        isValid = await trigger(["signature"])
      }
    }

    if (isValid || step < currentStep) {
      setCurrentStep(step)
      // Hide templates after first step
      if (step > 0) {
        setShowTemplates(false)
      } else {
        setShowTemplates(true)
      }
    }
  }

  const handlePreview = async () => {
    // Validate all form fields before showing preview
    const isFormValid = await trigger()
    if (isFormValid) {
      // Generate reference number if not already set
      if (!referenceNumber) {
        setReferenceNumber(generateReferenceNumber())
      }
      setShowPreview(true)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: t.errorMessage,
        description: t.pleaseLogin,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Generate a unique ID for the contract
      const contractId = uuidv4()

      // Upload signature to Supabase Storage
      const signatureUrl = await storageService.uploadSignature(user.id, data.signature)

      // Upload stamp to Supabase Storage if provided
      let stampUrl = null
      if (data.stamp) {
        stampUrl = await storageService.uploadStamp(user.id, data.stamp)
      }

      // Generate PDF
      const ref = referenceNumber || generateReferenceNumber()
      const pdfBlob = await generateContractPDF(
        {
          ...data,
          referenceNumber: ref,
        },
        language,
      )

      // Upload PDF to Supabase Storage
      const pdfUrl = await storageService.uploadPdf(user.id, pdfBlob)

      // Create contract in Supabase
      const contract = await contractService.createContract({
        id: contractId,
        user_id: user.id,
        reference_number: ref,
        contract_type: data.contractType,
        first_party_name: data.firstPartyName,
        second_party_name: data.secondPartyName,
        start_date: data.startDate,
        end_date: data.endDate,
        responsibilities: data.responsibilities,
        signature: signatureUrl,
        stamp: stampUrl,
        language,
        status: "completed",
        pdf_url: pdfUrl,
      })

      // Add notification
      addNotification({
        type: "success",
        message: t.successMessage,
        user_id: user.id,
        important: false,
        requires_read_receipt: false,
        category: "contract",
        related_item_id: contractId,
        related_item_type: "contract",
      })

      toast({
        title: t.success,
        description: t.successMessage,
      })

      // Reset form and state
      reset()
      setShowPreview(false)
      setValue("signature", "")
      setReferenceNumber("")
      setCurrentStep(0)
      setShowTemplates(true)

      // Redirect to contracts page
      router.push(`/contracts/${contractId}`)
    } catch (error) {
      console.error(error)
      toast({
        title: t.errorMessage,
        description: t.errorOccurred,
        variant: "destructive",
      })

      // Add error notification
      addNotification({
        type: "error",
        message: t.errorOccurred,
        user_id: user.id,
        important: true,
        requires_read_receipt: false,
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle template selection
  const handleSelectTemplate = async (templateId: string) => {
    try {
      const template = await templateService.getTemplateById(templateId)

      if (template) {
        // Apply template values
        setValue("contractType", template.contract_type)
        setValue("responsibilities", template.responsibilities)

        // Calculate default dates if template has defaultDuration
        const startDate = new Date()
        const endDate = new Date()

        if (template.default_duration) {
          endDate.setDate(startDate.getDate() + template.default_duration)
        } else {
          // Default to 30 days if no duration specified
          endDate.setDate(startDate.getDate() + 30)
        }

        // Format dates as YYYY-MM-DD for form inputs
        const formatDate = (date: Date) => {
          return date.toISOString().split("T")[0]
        }

        setValue("startDate", formatDate(startDate))
        setValue("endDate", formatDate(endDate))

        toast({
          title: t.templateApplied,
          description: template.name,
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: t.error,
        description: t.errorLoadingTemplate,
        variant: "destructive",
      })
    }
  }

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            {showTemplates && user && (
              <TemplateSelector
                language={language}
                onSelectTemplate={handleSelectTemplate}
                userId={user.id}
                showOnlyPublished={true}
              />
            )}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium">{t.firstPartyName}</label>
                <input
                  placeholder={t.enterFirstPartyName}
                  {...register("firstPartyName")}
                  className="w-full p-2 border rounded-md"
                />
                {errors.firstPartyName && <p className="text-red-500 text-sm">{errors.firstPartyName.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">{t.secondPartyName}</label>
                <input
                  placeholder={t.enterSecondPartyName}
                  {...register("secondPartyName")}
                  className="w-full p-2 border rounded-md"
                />
                {errors.secondPartyName && <p className="text-red-500 text-sm">{errors.secondPartyName.message}</p>}
              </div>
            </div>
          </>
        )
      case 1:
        return (
          <>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium">{t.contractType}</label>
                <select {...register("contractType")} className="w-full p-2 border rounded-md">
                  <option value="">{t.selectContractType}</option>
                  <option value="Assignment">{t.contractTypeOptions.assignment}</option>
                  <option value="Hourly">{t.contractTypeOptions.hourly}</option>
                  <option value="Fixed">{t.contractTypeOptions.fixed}</option>
                  <option value="Retainer">{t.contractTypeOptions.retainer}</option>
                </select>
                {errors.contractType && <p className="text-red-500 text-sm">{errors.contractType.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium">{t.startDate}</label>
                  <input type="date" {...register("startDate")} className="w-full p-2 border rounded-md" />
                  {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium">{t.endDate}</label>
                  <input type="date" {...register("endDate")} className="w-full p-2 border rounded-md" />
                  {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">{t.responsibilities}</label>
                <textarea
                  placeholder={t.enterResponsibilities}
                  {...register("responsibilities")}
                  className="w-full p-2 border rounded-md min-h-[120px]"
                />
                {errors.responsibilities && <p className="text-red-500 text-sm">{errors.responsibilities.message}</p>}
              </div>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <div className="space-y-4">
              {/* Signature Pad Component */}
              <SignaturePad
                value={signatureValue || ""}
                onChange={(value) => setValue("signature", value, { shouldValidate: true })}
                language={language}
                label={t.signature}
                required={true}
                error={errors.signature?.message}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium">{t.stamp}</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border rounded-md"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const base64 = await fileToBase64(file)
                      setValue("stamp", base64)
                      setStampPreview(base64)
                    }
                  }}
                />
                {stampPreview && (
                  <div className="mt-2 border rounded p-2 max-w-[200px]">
                    <img
                      src={stampPreview || "/placeholder.svg"}
                      alt="Stamp preview"
                      className="max-h-[100px] object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )
      case 3:
        // Final review step - show a summary of all entered information
        return (
          <>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">{t.parties}</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500">{t.firstPartyName}</p>
                    <p className="font-medium">{watch("firstPartyName")}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500">{t.secondPartyName}</p>
                    <p className="font-medium">{watch("secondPartyName")}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">{t.contractDetails}</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500">{t.contractType}</p>
                    <p className="font-medium">
                      {watch("contractType") &&
                        t.contractTypeOptions[
                          watch("contractType").toLowerCase() as keyof typeof t.contractTypeOptions
                        ]}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500">{t.duration}</p>
                    <p className="font-medium">
                      {watch("startDate")} {t.to} {watch("endDate")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">{t.responsibilities}</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="whitespace-pre-wrap">{watch("responsibilities")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {watch("signature") && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">{t.signature}</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <img
                        src={watch("signature") || "/placeholder.svg"}
                        alt="Signature"
                        className="max-h-24 object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}

                {watch("stamp") && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">{t.stamp}</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <img
                        src={watch("stamp") || "/placeholder.svg"}
                        alt="Stamp"
                        className="max-h-24 object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSaveTemplate = () => {}
  const handleUpdateTemplate = () => {}
  const handleDeleteTemplate = () => {}
  const handleImportTemplate = () => {}
  const customTemplates = []
  const currentUser = { name: "Test User" }

  const NotificationCenter = () => {
    return <div>Notifications</div>
  }

  const LoginForm = () => {
    return <div>Login</div>
  }

  const ApprovalDashboard = () => {
    return <div>Approvals</div>
  }

  return (
    <div className={language === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <LanguageToggle language={language} setLanguage={setLanguage} />
          <NotificationCenter language={language} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="create">{t.createContract}</TabsTrigger>
            <TabsTrigger value="templates">{t.myTemplates}</TabsTrigger>
            <TabsTrigger value="approvals">{t.approvals}</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <MultiStepForm
              steps={steps}
              currentStep={currentStep}
              onStepChange={handleStepChange}
              language={language}
              isSubmitting={loading}
              isLastStepPreview={true}
              onSubmit={currentStep === steps.length - 1 ? handlePreview : undefined}
            >
              {renderStepContent()}
            </MultiStepForm>
          </TabsContent>

          <TabsContent value="templates">
            <LoginForm language={language} />

            <TemplateSelector
              language={language}
              onSelectTemplate={handleSelectTemplate}
              onSaveTemplate={handleSaveTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onImportTemplate={handleImportTemplate}
              currentValues={{ contractType, responsibilities }}
              customTemplates={customTemplates}
              currentUser={currentUser?.name}
              showOnlyPublished={false}
            />
          </TabsContent>

          <TabsContent value="approvals">
            <LoginForm language={language} />

            <ApprovalDashboard language={language} onTemplateUpdated={handleUpdateTemplate} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Modal */}
      <ContractPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={loading}
        data={{
          ...getValues(),
          referenceNumber: referenceNumber || generateReferenceNumber(),
        }}
        language={language}
      />
    </div>
  )
}
