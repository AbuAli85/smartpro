import { redirect } from "next/navigation"
import { approveToken } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSupabaseClient } from "@/lib/supabase-client"

// Check if we're in a preview environment
const isPreviewEnvironment = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development"

// Create a mock token for preview environments
function createMockToken(tokenValue: string) {
  return {
    token: tokenValue,
    contract_id: "mock-id-" + Math.random().toString(36).substring(2, 9),
    party_role: Math.random() > 0.5 ? "first_party" : "second_party",
    party_name: Math.random() > 0.5 ? "Mock First Party" : "Mock Second Party",
    used: false,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    promoter_contracts: {
      id: "mock-contract-id",
      created_at: new Date().toISOString(),
    },
  }
}

export default async function ApprovalPage({ params }: { params: { token: string } }) {
  // Use our utility function to get the Supabase client
  const supabase = getServerSupabaseClient()

  // Get token information
  const { data: token, error } = await supabase
    .from("approval_tokens")
    .select("*, promoter_contracts(*)")
    .eq("token", params.token)
    .single()

  // If we're in a preview environment and there's an error, use mock data
  const tokenData = error && isPreviewEnvironment ? createMockToken(params.token) : token

  if (error && !isPreviewEnvironment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Approval Link</CardTitle>
            <CardDescription>This approval link is invalid or has expired.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Check if token is already used
  if (tokenData.used) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Already Approved</CardTitle>
            <CardDescription>This contract has already been approved by you.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href={`/contracts/${tokenData.contract_id}`}>View Contract</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Check if token is expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Approval Link Expired</CardTitle>
            <CardDescription>This approval link has expired.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  async function handleApproveContract() {
    const result = await approveToken(params.token)

    if (result.success) {
      redirect(`/contracts/${result.contractId}`)
    } else {
      console.error("Error approving contract:", result.error)
      redirect(`/approve/${params.token}?error=${result.error}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {isPreviewEnvironment && (
        <div className="absolute top-4 left-4 right-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">Preview Mode</p>
          <p className="text-sm">
            This is a preview using mock data. In production, this would use real data from the database.
          </p>
        </div>
      )}

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Approve Contract</CardTitle>
          <CardDescription>
            You are approving a contract as {tokenData.party_name} (
            {tokenData.party_role === "first_party" ? "First Party" : "Second Party"})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Contract Details</h3>
              <p className="text-sm text-gray-500">Contract ID: {tokenData.contract_id}</p>
              <p className="text-sm text-gray-500">Expires: {new Date(tokenData.expires_at).toLocaleDateString()}</p>
            </div>
            <div className="border-t pt-4">
              <p>
                By clicking "Approve Contract", you confirm that you have reviewed the contract and agree to its terms
                and conditions.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <form action={handleApproveContract} className="w-full">
            <Button type="submit" className="w-full">
              Approve Contract
            </Button>
          </form>
          <Button variant="outline" asChild className="w-full">
            <a href={`/contracts/${tokenData.contract_id}`}>View Contract First</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
