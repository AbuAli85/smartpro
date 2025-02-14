"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Upload, User, Building, Phone, Globe, FileText, Hash, CreditCard, MapPin } from "lucide-react"

const businessFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type BusinessFormValues = z.infer<typeof businessFormSchema>

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Array<{ name: string; url: string }>>([])

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      companyName: "",
      registrationNumber: "",
      taxId: "",
      companyAddress: "",
      phoneNumber: "",
      website: "",
    },
  })

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      await update({
        name: formData.get("name"),
        email: formData.get("email"),
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your profile.",
        variant: "destructive",
      })
    }
  }

  const handleBusinessUpdate = async (data: BusinessFormValues) => {
    try {
      // Here you would typically send the data to your API
      await fetch("/api/user/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      toast({
        title: "Business details updated",
        description: "Your business information has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your business information.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "logo" | "document") => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()

      if (type === "logo") {
        await update({ image: data.url })
      } else {
        setDocuments((prev) => [...prev, { name: file.name, url: data.url }])
      }

      toast({
        title: "File uploaded",
        description: `${type === "logo" ? "Company logo" : "Document"} has been uploaded successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error uploading your file.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and business information</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">Upload a new profile picture</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="relative">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "logo")}
                        disabled={isUploading}
                      />
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={session?.user?.name || ""} placeholder="Enter your name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={session?.user?.email || ""}
                    placeholder="Enter your email"
                  />
                </div>
                <Button type="submit">Update profile</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Manage your company details and business information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleBusinessUpdate)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      <Building className="h-4 w-4 inline mr-2" />
                      Company Name
                    </Label>
                    <Input id="companyName" {...form.register("companyName")} placeholder="Enter company name" />
                    {form.formState.errors.companyName && (
                      <p className="text-sm text-red-500">{form.formState.errors.companyName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">
                      <Hash className="h-4 w-4 inline mr-2" />
                      Business Registration Number
                    </Label>
                    <Input
                      id="registrationNumber"
                      {...form.register("registrationNumber")}
                      placeholder="Enter registration number"
                    />
                    {form.formState.errors.registrationNumber && (
                      <p className="text-sm text-red-500">{form.formState.errors.registrationNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">
                      <CreditCard className="h-4 w-4 inline mr-2" />
                      Tax ID Number
                    </Label>
                    <Input id="taxId" {...form.register("taxId")} placeholder="Enter tax ID" />
                    {form.formState.errors.taxId && (
                      <p className="text-sm text-red-500">{form.formState.errors.taxId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number
                    </Label>
                    <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="Enter phone number" />
                    {form.formState.errors.phoneNumber && (
                      <p className="text-sm text-red-500">{form.formState.errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Website
                    </Label>
                    <Input id="website" {...form.register("website")} placeholder="Enter website URL" />
                    {form.formState.errors.website && (
                      <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Company Address
                  </Label>
                  <Textarea
                    id="companyAddress"
                    {...form.register("companyAddress")}
                    placeholder="Enter company address"
                    className="min-h-[100px]"
                  />
                  {form.formState.errors.companyAddress && (
                    <p className="text-sm text-red-500">{form.formState.errors.companyAddress.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Update Business Information
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Legal Documents</CardTitle>
              <CardDescription>Upload and manage your company's legal documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">Business License</h4>
                        <p className="text-sm text-muted-foreground">Upload your business license</p>
                      </div>
                    </div>
                    <Button variant="outline" className="relative">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, "document")}
                        disabled={isUploading}
                      />
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">Tax Certificate</h4>
                        <p className="text-sm text-muted-foreground">Upload your tax certificate</p>
                      </div>
                    </div>
                    <Button variant="outline" className="relative">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, "document")}
                        disabled={isUploading}
                      />
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">Other Documents</h4>
                        <p className="text-sm text-muted-foreground">Upload additional legal documents</p>
                      </div>
                    </div>
                    <Button variant="outline" className="relative">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, "document")}
                        disabled={isUploading}
                      />
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Uploaded Documents</h4>
                    <div className="space-y-2">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-sm">{doc.name}</span>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences and password</CardDescription>
            </CardHeader>
            <CardContent>{/* Security settings content */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

