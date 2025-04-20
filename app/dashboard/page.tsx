"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, LayoutTemplate } from "lucide-react"

interface Contract {
  id: string
  reference_number: string
  contract_type: string
  first_party_name: string
  second_party_name: string
  created_at: string
  status: string
}

export default function Dashboard() {
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push("/login?redirectedFrom=/dashboard")
      return
    }

    // Load contracts (mock data for now)
    const mockContracts: Contract[] = [
      {
        id: "1",
        reference_number: "PRM-2023-1001",
        contract_type: "Assignment",
        first_party_name: "Company A",
        second_party_name: "Company B",
        created_at: new Date().toISOString(),
        status: "active",
      },
      {
        id: "2",
        reference_number: "PRM-2023-1002",
        contract_type: "Hourly",
        first_party_name: "Company C",
        second_party_name: "Company D",
        created_at: new Date().toISOString(),
        status: "draft",
      },
    ]

    setContracts(mockContracts)
    setIsLoading(false)
  }, [router])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/new-contract">
            <Plus className="mr-2 h-4 w-4" /> Create Contract
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{contracts.length}</p>
            <p className="text-sm text-gray-500">Total contracts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{contracts.filter((c) => c.status === "active").length}</p>
            <p className="text-sm text-gray-500">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Draft Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{contracts.filter((c) => c.status === "draft").length}</p>
            <p className="text-sm text-gray-500">Pending completion</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Contracts</h2>

      {contracts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium mb-1">No contracts yet</h3>
          <p className="text-gray-500 mb-4">Create your first contract to get started</p>
          <Button asChild>
            <Link href="/new-contract">
              <Plus className="mr-2 h-4 w-4" /> Create Contract
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contract.reference_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.contract_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contract.first_party_name} & {contract.second_party_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(contract.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contract.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/contracts/${contract.id}`} className="text-blue-600 hover:text-blue-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LayoutTemplate className="h-5 w-5 mr-2" />
                Browse Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">Browse our collection of pre-made contract templates</p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/templates">View Templates</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
