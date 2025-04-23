"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/app/contexts/auth-context"
import { edgeFunctions } from "@/app/lib/edge-function-client"

// Form validation schema
const formSchema = z.object({
  contractName: z.string().min(2, "Contract name must be at least 2 characters"),
  contractType: z.string().min(2, "Contract type is required"),
  description: z.string().optional(),
  parties: z
    .array(
      z.object({
        name: z.string().min(2, "Party name is required"),
        role: z.string().min(2, "Party role is required"),
      }),
    )
    .min(2, "At least two parties are required"),
})

type FormValues = z.infer<typeof formSchema>

export default function ContractGeneratorForm() {
  const { authenticated } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractName: "",
      contractType: "standard",
      description: "",
      parties: [
        { name: "", role: "first_party" },
        { name: "", role: "second_party" },
      ],
    },
  })

  async function onSubmit(values: FormValues) {
    if (!authenticated) {
      setError("You must be logged in to generate contracts")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Call the Edge Function directly from the client component
      const result = await edgeFunctions.generateContract(values)

      if (result.contractId) {
        router.push(`/contracts/${result.contractId}`)
      } else {
        setError("Failed to generate contract")
      }
    } catch (err) {
      console.error("Error generating contract:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!authenticated) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You need to be logged in to generate contracts.
          <Button variant="link" className="p-0 h-auto font-normal" onClick={() => router.push("/login")}>
            Go to login
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Contract</CardTitle>
        <CardDescription>Fill in the details to generate a new contract</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="contractName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contract name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contract type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter contract description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Parties</h3>

              {form.watch("parties").map((_, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name={`parties.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Party Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter party name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`parties.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Party Role</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter party role" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Contract...
                </>
              ) : (
                "Generate Contract"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        All contracts are generated securely using Edge Functions with authentication.
      </CardFooter>
    </Card>
  )
}
