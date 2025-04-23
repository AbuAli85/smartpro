"use client"

import { useState } from "react"
import { useAuth } from "@/app/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { edgeFunctions } from "@/app/lib/edge-function-client"

export default function EdgeFunctionDemo() {
  const { authenticated, user } = useAuth()
  const [activeTab, setActiveTab] = useState("quick-processor")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [success, setSuccess] = useState(false)

  // Form states
  const [quickProcessorData, setQuickProcessorData] = useState<{ name: string }>({ name: "Functions" })
  const [contractId, setContractId] = useState<string>("")
  const [documentData, setDocumentData] = useState<string>("{}")

  // Reset state when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setError(null)
    setResult(null)
    setSuccess(false)
  }

  // Call the quick-processor Edge Function
  const handleQuickProcessor = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setSuccess(false)

    try {
      const response = await edgeFunctions.callQuickProcessor(quickProcessorData)
      setResult(response)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Call the generate-contract Edge Function
  const handleGenerateContract = async () => {
    if (!contractId.trim()) {
      setError("Contract ID is required")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setSuccess(false)

    try {
      const response = await edgeFunctions.generateContract(contractId)
      setResult(response)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Call the process-document Edge Function
  const handleProcessDocument = async () => {
    let parsedData: any

    try {
      parsedData = JSON.parse(documentData)
    } catch (err) {
      setError("Invalid JSON data")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setSuccess(false)

    try {
      const response = await edgeFunctions.processDocument(parsedData)
      setResult(response)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!authenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>You need to log in to use Edge Functions</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Authenticated</AlertTitle>
            <AlertDescription>Please log in to access this feature.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edge Function Demo</CardTitle>
        <CardDescription>
          Test Supabase Edge Functions with authentication. Logged in as {user?.email || "User"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick-processor">Quick Processor</TabsTrigger>
            <TabsTrigger value="generate-contract">Generate Contract</TabsTrigger>
            <TabsTrigger value="process-document">Process Document</TabsTrigger>
          </TabsList>

          {/* Quick Processor Tab */}
          <TabsContent value="quick-processor" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={quickProcessorData.name}
                onChange={(e) => setQuickProcessorData({ name: e.target.value })}
                placeholder="Enter a name"
              />
            </div>
            <Button onClick={handleQuickProcessor} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Call quick-processor"
              )}
            </Button>
          </TabsContent>

          {/* Generate Contract Tab */}
          <TabsContent value="generate-contract" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contract ID</label>
              <Input
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                placeholder="Enter contract ID"
              />
            </div>
            <Button onClick={handleGenerateContract} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Contract"
              )}
            </Button>
          </TabsContent>

          {/* Process Document Tab */}
          <TabsContent value="process-document" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Data (JSON)</label>
              <Textarea
                value={documentData}
                onChange={(e) => setDocumentData(e.target.value)}
                placeholder='{"key": "value"}'
                rows={5}
              />
            </div>
            <Button onClick={handleProcessDocument} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Document"
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Edge Function call completed successfully.</AlertDescription>
          </Alert>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Response:</h3>
            <pre className="text-sm overflow-auto p-2 bg-gray-100 rounded">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        All Edge Function calls are authenticated using your JWT token.
      </CardFooter>
    </Card>
  )
}
