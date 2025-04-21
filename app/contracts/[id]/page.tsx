import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getApprovalTokens } from "@/app/actions"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function ContractPage({ params }: { params: { id: string } }) {
  const { data: contract, error } = await supabase.from("promoter_contracts").select("*").eq("id", params.id).single()

  if (error || !contract) {
    notFound()
  }

  const { contract_data, contract_layout } = contract

  // Get approval tokens
  const { success, tokens, error: tokensError } = await getApprovalTokens(params.id)

  const approvalStatus = {
    first_party: { approved: false, token: "" },
    second_party: { approved: false, token: "" },
  }

  if (success && tokens) {
    tokens.forEach((token) => {
      if (token.party_role === "first_party") {
        approvalStatus.first_party.approved = token.used
        approvalStatus.first_party.token = token.token
      } else if (token.party_role === "second_party") {
        approvalStatus.second_party.approved = token.used
        approvalStatus.second_party.token = token.token
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Contract Header */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Bilingual Promotion Contract</h1>
            <div className="text-sm text-gray-500">Contract ID: {params.id}</div>
          </div>
        </div>

        {/* Approval Status */}
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold mb-2">Approval Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${approvalStatus.first_party.approved ? "bg-green-500" : "bg-yellow-500"}`}
              ></div>
              <span>
                {contract_data.first_party_name_en}: {approvalStatus.first_party.approved ? "Approved" : "Pending"}
              </span>
              {!approvalStatus.first_party.approved && (
                <Link
                  href={`/approve/${approvalStatus.first_party.token}`}
                  className="text-xs bg-primary text-white px-2 py-1 rounded"
                >
                  Approval Link
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${approvalStatus.second_party.approved ? "bg-green-500" : "bg-yellow-500"}`}
              ></div>
              <span>
                {contract_data.second_party_name_en}: {approvalStatus.second_party.approved ? "Approved" : "Pending"}
              </span>
              {!approvalStatus.second_party.approved && (
                <Link
                  href={`/approve/${approvalStatus.second_party.token}`}
                  className="text-xs bg-primary text-white px-2 py-1 rounded"
                >
                  Approval Link
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Contract Content */}
        <div className="p-6 space-y-8">
          {/* Letterhead */}
          <div className="flex justify-center mb-6">
            <div className="relative h-32 w-64">
              <Image
                src={contract_data.letterhead_image_url || "/placeholder.svg"}
                alt="Company Letterhead"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Parties Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Parties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-medium">First Party</h3>
                <p>
                  <span className="font-medium">Name:</span> {contract_data.first_party_name_en}
                </p>
                <p>
                  <span className="font-medium">CR:</span> {contract_data.first_party_cr}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Second Party</h3>
                <p>
                  <span className="font-medium">Name:</span> {contract_data.second_party_name_en}
                </p>
                <p>
                  <span className="font-medium">CR:</span> {contract_data.second_party_cr}
                </p>
              </div>
            </div>
          </div>

          {/* Promoter Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Promoter Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {contract_data.promoter_name_en}
                </p>
                <p>
                  <span className="font-medium">ID:</span> {contract_data.promoter_id}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium">ID Photo</p>
                  <div className="relative h-32 w-full border rounded">
                    <Image
                      src={contract_data.id_photo_url || "/placeholder.svg"}
                      alt="ID Photo"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Passport Photo</p>
                  <div className="relative h-32 w-full border rounded">
                    <Image
                      src={contract_data.passport_photo_url || "/placeholder.svg"}
                      alt="Passport Photo"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Contract Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Product:</span> {contract_data.product_name_en}
                </p>
                <p>
                  <span className="font-medium">Location:</span> {contract_data.location_name_en}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Start Date:</span>{" "}
                  {new Date(contract_data.start_date as string).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">End Date:</span>{" "}
                  {new Date(contract_data.end_date as string).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
