"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, AlertCircle, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createContract } from "./actions"
import { useRouter } from "next/navigation"
import UploadImageInput from "./components/upload-image-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "./contexts/language-context"
import { edgeFunctions } from "./lib/edge-function-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "./contexts/auth-context"
import Link from "next/link"
import { hasPermission } from "@/lib/utils"

// Define the form schema with Zod
const formSchema = z.object({
  firstPartyName: z.string().min(2, {
    message: "First party name must be at least 2 characters.",
  }),
  firstPartyNameAr: z.string().min(2, {
    message: "First party Arabic name must be at least 2 characters.",
  }),
  firstPartyAddress: z.string().min(5, {
    message: "First party address must be at least 5 characters.",
  }),
  firstPartyAddressAr: z.string().min(5, {
    message: "First party Arabic address must be at least 5 characters.",
  }),
  secondPartyName: z.string().min(2, {
    message: "Second party name must be at least 2 characters.",
  }),
  secondPartyNameAr: z.string().min(2, {
    message: "Second party Arabic name must be at least 2 characters.",
  }),
  secondPartyAddress: z.string().min(5, {
    message: "Second party address must be at least 5 characters.",
  }),
  secondPartyAddressAr: z.string().min(5, {
    message: "Second party Arabic address must be at least 5 characters.",
  }),
  promoterName: z.string().min(2, {
    message: "Promoter name must be at least 2 characters.",
  }),
  promoterNameAr: z.string().min(2, {
    message: "Promoter Arabic name must be at least 2 characters.",
  }),
  productName: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  productNameAr: z.string().min(2, {
    message: "Product Arabic name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  locationAr: z.string().min(2, {
    message: "Location Arabic name must be at least 2 characters.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
  templateId: z.string({
    required_error: "Please select a template.",
  }),
  firstPartySignature: z.string().optional(),
  secondPartySignature: z.string().optional(),
})

// Define the type for form placeholders
interface FormPlaceholders {
  id: number
  form_type: string
  title: string
  title_ar?: string
  first_party_label: string
  first_party_label_ar?: string
  second_party_label: string
  second_party_label_ar?: string
  promoter_label: string
  promoter_label_ar?: string
  product_location_label: string
  product_location_label_ar?: string
  contract_period_label: string
  contract_period_label_ar?: string
  template_label: string
  template_label_ar?: string
  documents_label: string
  documents_label_ar?: string
  created_at: string
  updated_at: string
}

export default function ContractForm() {
  const router = useRouter()
  const { language } = useLanguage()
  const { authenticated, user, loading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [placeholders, setPlaceholders] = useState<FormPlaceholders>({
    id: 0,
    form_type: "contract_form",
    title: "Create Bilingual Contract",
    title_ar: "إنشاء عقد ثنائي اللغة",
    first_party_label: "First Party Information",
    first_party_label_ar: "معلومات الطرف الأول",
    second_party_label: "Second Party Information",
    second_party_label_ar: "معلومات الطرف الثاني",
    promoter_label: "Promoter Information",
    promoter_label_ar: "معلومات المروج",
    product_location_label: "Product and Location",
    product_location_label_ar: "المنتج والموقع",
    contract_period_label: "Contract Period",
    contract_period_label_ar: "مدة العقد",
    template_label: "Contract Template",
    template_label_ar: "نموذج العقد",
    documents_label: "Documents",
    documents_label_ar: "المستندات",
    created_at: "",
    updated_at: "",
  })

  // Initialize the form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstPartyName: "",
      firstPartyNameAr: "",
      firstPartyAddress: "",
      firstPartyAddressAr: "",
      secondPartyName: "",
      secondPartyNameAr: "",
      secondPartyAddress: "",
      secondPartyAddressAr: "",
      promoterName: "",
      promoterNameAr: "",
      productName: "",
      productNameAr: "",
      location: "",
      locationAr: "",
      templateId: "",
    },
  })

  const [authError, setAuthError] = useState<string | null>(null)

  // Check if user has permission to create contracts
  const canCreateContracts = user?.role && hasPermission(user.role, "create_contracts")

  // Fetch contract templates using Edge Function
  useEffect(() => {
    const fetchTemplates = async () => {
      if (authLoading) return // Wait until auth state is determined

      if (!authenticated) {
        console.log("User not authenticated, skipping template fetch")
        setTemplates([{ id: "default", name: "Default Template" }])
        return
      }

      try {
        // Only fetch if authenticated and has permission
        if (authenticated && canCreateContracts) {
          const templates = await edgeFunctions.contract.getContractTemplates()
          setTemplates(templates)
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
        setError("Failed to load templates. Please try again later.")
        // Fallback to a default template
        setTemplates([{ id: "default", name: "Default Template" }])
      }
    }

    fetchTemplates()
  }, [authenticated, authLoading, canCreateContracts])

  // Fetch form placeholders using Edge Function
  useEffect(() => {
    const fetchPlaceholders = async () => {
      if (authLoading) return // Wait until auth state is determined

      if (!authenticated) {
        console.log("User not authenticated, using default placeholders")
        return // Use default placeholders
      }

      try {
        const data = await edgeFunctions.contract.getFormPlaceholders("contract_form")
        if (data) {
          setPlaceholders(data as FormPlaceholders)
        }
      } catch (error) {
        console.error("Error fetching placeholders:", error)
        // If there's an error, we'll use the default placeholders
      }
    }

    fetchPlaceholders()
  }, [authenticated, authLoading])

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!authenticated) {
      setAuthError("You must be logged in to create contracts")
      return
    }

    if (!canCreateContracts) {
      setAuthError("You don't have permission to create contracts")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createContract(values)
      if (result.success && result.contractId) {
        router.push(`/contracts/${result.contractId}`)
      } else {
        console.error("Failed to create contract:", result.error)
        setError(result.error || "Failed to create contract. Please try again.")
      }
    } catch (error) {
      console.error("Error creating contract:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get the appropriate label based on the current language
  const getLabel = (enLabel: string, arLabel?: string) => {
    if (language === "ar" && arLabel) {
      return arLabel
    }
    return enLabel
  }

  // Show authentication warning if not authenticated
  if (!authLoading && !authenticated) {
    return (
      <div className={language === "ar" ? "rtl" : "ltr"}>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to create contracts.
            <div className="mt-4">
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  {language === "en" ? "Go to Login" : "الذهاب إلى تسجيل الدخول"}
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <h1 className="text-2xl font-bold mb-6">{getLabel(placeholders.title, placeholders.title_ar)}</h1>
        <p className="text-muted-foreground">
          {language === "en"
            ? "This form allows you to create bilingual contracts. Please log in to access this feature."
            : "يتيح لك هذا النموذج إنشاء عقود ثنائية اللغة. يرجى تسجيل الدخول للوصول إلى هذه الميزة."}
        </p>
      </div>
    )
  }

  if (authError) {
    return (
      <div className={language === "ar" ? "rtl" : "ltr"}>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={language === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold mb-6">{getLabel(placeholders.title, placeholders.title_ar)}</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* First Party Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">
              {getLabel(placeholders.first_party_label, placeholders.first_party_label_ar)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstPartyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Name (English)" : "الاسم (بالإنجليزية)"}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === "en" ? "Enter name" : "أدخل الاسم"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstPartyNameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Name (Arabic)" : "الاسم (بالعربية)"}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === "en" ? "Enter Arabic name" : "أدخل الاسم بالعربية"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstPartyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Address (English)" : "العنوان (بالإنجليزية)"}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={language === "en" ? "Enter address" : "أدخل العنوان"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstPartyAddressAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Address (Arabic)" : "العنوان (بالعربية)"}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={language === "en" ? "Enter Arabic address" : "أدخل العنوان بالعربية"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Second Party Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">
              {getLabel(placeholders.second_party_label, placeholders.second_party_label_ar)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="secondPartyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Name (English)" : "الاسم (بالإنجليزية)"}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === "en" ? "Enter name" : "أدخل الاسم"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondPartyNameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Name (Arabic)" : "الاسم (بالعربية)"}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === "en" ? "Enter Arabic name" : "أدخل الاسم بالعربية"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondPartyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Address (English)" : "العنوان (بالإنجليزية)"}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={language === "en" ? "Enter address" : "أدخل العنوان"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondPartyAddressAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Address (Arabic)" : "العنوان (بالعربية)"}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={language === "en" ? "Enter Arabic address" : "أدخل العنوان بالعربية"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Promoter Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">
              {getLabel(placeholders.promoter_label, placeholders.promoter_label_ar)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="promoterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Name (English)" : "الاسم (بالإنجليزية)"}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === "en" ? "Enter promoter name" : "أدخل اسم المروج"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promoterNameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Name (Arabic)" : "الاسم (بالعربية)"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === "en" ? "Enter Arabic promoter name" : "أدخل اسم المروج بالعربية"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Product and Location */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">
              {getLabel(placeholders.product_location_label, placeholders.product_location_label_ar)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Product Name (English)" : "اسم المنتج (بالإنجليزية)"}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === "en" ? "Enter product name" : "أدخل اسم المنتج"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productNameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Product Name (Arabic)" : "اسم المنتج (بالعربية)"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === "en" ? "Enter Arabic product name" : "أدخل اسم المنتج بالعربية"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Location (English)" : "الموقع (بالإنجليزية)"}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === "en" ? "Enter location" : "أدخل الموقع"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Location (Arabic)" : "الموقع (بالعربية)"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === "en" ? "Enter Arabic location" : "أدخل الموقع بالعربية"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Contract Period */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">
              {getLabel(placeholders.contract_period_label, placeholders.contract_period_label_ar)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{language === "en" ? "Start Date" : "تاريخ البدء"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{language === "en" ? "Select date" : "اختر التاريخ"}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{language === "en" ? "End Date" : "تاريخ الانتهاء"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{language === "en" ? "Select date" : "اختر التاريخ"}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("startDate")
                            return startDate && date < startDate
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Contract Template */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">
              {getLabel(placeholders.template_label, placeholders.template_label_ar)}
            </h2>
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "en" ? "Select Template" : "اختر النموذج"}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select a template" : "اختر نموذجًا"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Documents */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">
              {getLabel(placeholders.documents_label, placeholders.documents_label_ar)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstPartySignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "First Party Signature" : "توقيع الطرف الأول"}</FormLabel>
                    <FormControl>
                      <UploadImageInput value={field.value} onChange={field.onChange} placeholder={language} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondPartySignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "en" ? "Second Party Signature" : "توقيع الطرف الثاني"}</FormLabel>
                    <FormControl>
                      <UploadImageInput value={field.value} onChange={field.onChange} placeholder={language} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button disabled={isSubmitting || !authenticated || !canCreateContracts} type="submit">
            {isSubmitting ? (
              <>
                Submitting <span className="inline-block animate-spin">🔄</span>
              </>
            ) : (
              getLabel("Create Contract", "إنشاء عقد")
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
