import { getSupabaseServer } from "@/lib/supabase/server"
import { serverContractService } from "@/services/contract-service"
import { redirect } from "next/navigation"
import ContractDetails from "@/components/contract/contract-details"

export default async function ContractPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectedFrom=/contracts/" + params.id)
  }

  try {
    const contract = await serverContractService.getContractById(params.id)

    // Check if user has permission to view this contract
    if (contract.user_id !== session.user.id) {
      redirect("/dashboard")
    }

    return <ContractDetails contract={contract} />
  } catch (error) {
    console.error("Error loading contract:", error)
    redirect("/dashboard")
  }
}
