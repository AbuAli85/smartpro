import { createClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { approveToken } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function ApprovalPage({ params }: { params: { token: string } }) {
  // Get token information
  const { data: token, error } = await supabase
    .from("approval_tokens")
    .select("*, promoter_contracts(*)")
    .eq("token", params.token)
    .single()

  if (error || !token) {
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
  if (token.used) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Already Approved</CardTitle>
            <CardDescription>This contract has already been approved by you.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href={`/contracts/${token.contract_id}`}>View Contract</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Check if token is expired
  if (new Date(token.expires_at) < new Date()) {
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Approve Contract</CardTitle>
          <CardDescription>
            You are approving a contract as {token.party_name} (
            {token.party_role === "first_party" ? "First Party" : "Second Party"})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Contract Details</h3>
              <p className="text-sm text-gray-500">Contract ID: {token.contract_id}</p>
              <p className="text-sm text-gray-500">Expires: {new Date(token.expires_at).toLocaleDateString()}</p>
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
            <a href={`/contracts/${token.contract_id}`}>View Contract First</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
