"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2, Save } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import UploadImageInput from "@/app/components/upload-image-input"
import { edgeFunctions } from "@/app/lib/edge-function-client"

// Form schema remains the same
const formSchema = z.object({
  // First Party
  first_party_name_en: z.string().min(2, "First party name (English) is required"),
  first_party_name_ar: z.string().optional(),
  first_party_cr: z.string().min(2, "First party CR is required"),

  // Second Party
  second_party_name_en: z.string().min(2, "Second party name (English) is required"),
  second_party_name_ar: z.string().optional(),
  second_party_cr: z.string().min(2, "Second party CR is required"),

  // Promoter
  promoter_name_en: z.string().min(2, "Promoter name (English) is required"),
  promoter_name_ar: z.string().optional(),
  promoter_id: z.string().min(2, "Promoter ID is required"),

  // Product and Location
  product_name_en: z.string().min(2, "Product name (English) is required"),
  product_name_ar: z.string().optional(),
  location_name_en: z.string().min(2, "Location name (English) is required"),
  location_name_ar: z.string().optional(),

  // Dates
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z.date({
    required_error: "End date is required",
  }),

  // Contract Text
  contract_text_en: z.string().optional(),
  contract_text_ar: z.string().optional(),

  // Images
  letterhead_image_url: z.string().min(1, "Letterhead image is required"),
  id_photo_url: z.string().min(1, "ID photo is required"),
  passport_photo_url: z.string().min(1, "Passport photo is required"),
})

type FormValues = z.infer<typeof formSchema>

export default function AdminCreatePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_party_name_en: "",
      first_party_name_ar: "",
      first_party_cr: "",
      second_party_name_en: "",
      second_party_name_ar: "",
      second_party_cr: "",
      promoter_name_en: "",
      promoter_name_ar: "",
      promoter_id: "",
      product_name_en: "",
      product_name_ar: "",
      location_name_en: "",
      location_name_ar: "",
      contract_text_en: "",
      contract_text_ar: "",
      letterhead_image_url: "",
      id_photo_url: "",
      passport_photo_url: "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)

      // Generate contract layout using Edge Function
      const contractLayout = await edgeFunctions.contract.generateContractLayout(values)

      // Create contract using Edge Function
      const result = await edgeFunctions.contract.createContract({
        contract_data: values,
        contract_layout: contractLayout,
      })

      toast({
        title: "Contract created successfully",
        description: `Contract ID: ${result.contractId}`,
      })

      // Redirect to the contract view page with the correct path
      router.push(`/contracts/${result.contractId}`)
    } catch (error) {
      console.error("Error creating contract:", error)
      toast({
        title: "Error creating contract",
        description: "An error occurred while creating the contract. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Rest of the component remains the same
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Contract</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="parties">Parties</TabsTrigger>
                <TabsTrigger value="content">Contract Text</TabsTrigger>
                <TabsTrigger value="uploads">Uploads</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Promoter Information */}
                  <div className="space-y-4 md:col-span-2">
                    <h2 className="text-lg font-semibold">Promoter Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="promoter_name_en"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promoter Name (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="promoter_name_ar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promoter Name (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name in Arabic" {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="promoter_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promoter ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter ID number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Product and Location */}
                  <div className="space-y-4 md:col-span-2">
                    <h2 className="text-lg font-semibold">Product and Location</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="product_name_en"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="product_name_ar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name in Arabic" {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location_name_en"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Name (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location_name_ar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Name (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter location in Arabic" {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-4 md:col-span-2">
                    <h2 className="text-lg font-semibold">Contract Period</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Parties Tab */}
              <TabsContent value="parties" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* First Party Information */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">First Party Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_party_name_en"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Party Name (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="first_party_name_ar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Party Name (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name in Arabic" {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="first_party_cr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Party CR</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter CR number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Second Party Information */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Second Party Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="second_party_name_en"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Second Party Name (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="second_party_name_ar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Second Party Name (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name in Arabic" {...field} dir="rtl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="second_party_cr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Second Party CR</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter CR number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Contract Text Tab */}
              <TabsContent value="content" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="contract_text_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Text (English)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter contract text in English" className="min-h-[300px]" {...field} />
                        </FormControl>
                        <FormDescription>Leave blank to use the default template</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contract_text_ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Text (Arabic)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter contract text in Arabic"
                            className="min-h-[300px]"
                            dir="rtl"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Leave blank to use the default template</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Uploads Tab */}
              <TabsContent value="uploads" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="letterhead_image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <UploadImageInput
                              id="letterhead_image"
                              label="Letterhead Image"
                              value={field.value}
                              onChange={field.onChange}
                              required
                              bucketName="contract-assets"
                              folderPath="letterheads"
                            />
                          </FormControl>
                          <FormDescription>Upload a letterhead image for the contract</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="id_photo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <UploadImageInput
                            id="id_photo"
                            label="ID Photo"
                            value={field.value}
                            onChange={field.onChange}
                            required
                            bucketName="contract-assets"
                            folderPath="id-photos"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passport_photo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <UploadImageInput
                            id="passport_photo"
                            label="Passport Photo"
                            value={field.value}
                            onChange={field.onChange}
                            required
                            bucketName="contract-assets"
                            folderPath="passport-photos"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Contract...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Contract
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
