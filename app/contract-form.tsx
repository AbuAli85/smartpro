"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { createContract } from "./actions"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const formSchema = z.object({
  first_party_name_en: z.string().min(2, {
    message: "First party name must be at least 2 characters.",
  }),
  first_party_cr: z.string().min(2, {
    message: "First party CR must be at least 2 characters.",
  }),
  second_party_name_en: z.string().min(2, {
    message: "Second party name must be at least 2 characters.",
  }),
  second_party_cr: z.string().min(2, {
    message: "Second party CR must be at least 2 characters.",
  }),
  promoter_name_en: z.string().min(2, {
    message: "Promoter name must be at least 2 characters.",
  }),
  promoter_id: z.string().min(2, {
    message: "Promoter ID must be at least 2 characters.",
  }),
  product_name_en: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  location_name_en: z.string().min(2, {
    message: "Location name must be at least 2 characters.",
  }),
  start_date: z.date({
    required_error: "Start date is required.",
  }),
  end_date: z.date({
    required_error: "End date is required.",
  }),
})

export default function ContractForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [idPhoto, setIdPhoto] = useState<File | null>(null)
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null)
  const [letterheadImage, setLetterheadImage] = useState<File | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_party_name_en: "",
      first_party_cr: "",
      second_party_name_en: "",
      second_party_cr: "",
      promoter_name_en: "",
      promoter_id: "",
      product_name_en: "",
      location_name_en: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Validate file uploads
      if (!idPhoto) {
        toast({
          title: "Error",
          description: "ID photo is required",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!passportPhoto) {
        toast({
          title: "Error",
          description: "Passport photo is required",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!letterheadImage) {
        toast({
          title: "Error",
          description: "Letterhead image is required",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Create form data with all fields
      const formData = new FormData()

      // Add text and date fields
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString())
        } else {
          formData.append(key, value)
        }
      })

      // Add file fields
      formData.append("id_photo", idPhoto)
      formData.append("passport_photo", passportPhoto)
      formData.append("letterhead_image", letterheadImage)

      // Submit the form
      const result = await createContract(formData)

      if (result.success) {
        toast({
          title: "Contract created",
          description: `Contract ID: ${result.contractId}`,
        })

        // Optionally redirect to the contract page
        router.push(`/contracts/${result.contractId}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create contract",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        })
        return
      }

      setFile(file)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Bilingual Contract</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Party Information */}
            <div className="space-y-4 md:col-span-2">
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
            <div className="space-y-4 md:col-span-2">
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

            {/* File Uploads */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-lg font-semibold">Document Uploads</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <FormLabel htmlFor="id_photo">ID Photo</FormLabel>
                  <Input id="id_photo" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setIdPhoto)} />
                  <FormDescription>Upload a photo of the ID (max 5MB)</FormDescription>
                  {idPhoto && <p className="text-sm text-green-600">File selected: {idPhoto.name}</p>}
                </div>

                <div className="space-y-2">
                  <FormLabel htmlFor="passport_photo">Passport Photo</FormLabel>
                  <Input
                    id="passport_photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setPassportPhoto)}
                  />
                  <FormDescription>Upload a photo of the passport (max 5MB)</FormDescription>
                  {passportPhoto && <p className="text-sm text-green-600">File selected: {passportPhoto.name}</p>}
                </div>

                <div className="space-y-2">
                  <FormLabel htmlFor="letterhead_image">Letterhead Image</FormLabel>
                  <Input
                    id="letterhead_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setLetterheadImage)}
                  />
                  <FormDescription>Upload a letterhead image (max 5MB)</FormDescription>
                  {letterheadImage && <p className="text-sm text-green-600">File selected: {letterheadImage.name}</p>}
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Contract...
              </>
            ) : (
              "Create Contract"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
