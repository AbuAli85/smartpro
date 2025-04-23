"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/app/components/header"
import RoleGuard from "@/app/components/role-guard"
import { UserRole } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { contractApi } from "@/app/lib/api-client"

export default function CompanyDashboardPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.COMPANY]}>
      <Header />
      <div className="container py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Company Dashboard</h1>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="promoters">Promoters</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  title="Active Contracts"
                  value="12"
                  description="Current active contracts"
                  icon={<FileText className="h-6 w-6 text-blue-500" />}
                />
                <StatsCard
                  title="Pending Approvals"
                  value="3"
                  description="Contracts awaiting approval"
                  icon={<Clock className="h-6 w-6 text-amber-500" />}
                />
                <StatsCard
                  title="Active Promoters"
                  value="8"
                  description="Promoters with active contracts"
                  icon={<CheckCircle className="h-6 w-6 text-green-500" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button asChild className="w-full justify-start">
                      <Link href="/company/contracts/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Contract
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/company/promoters">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Manage Promoters
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/company/reports">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Reports
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest contract activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActivityFeed />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contracts" className="space-y-6 mt-6">
              <ContractsList />
            </TabsContent>

            <TabsContent value="promoters" className="space-y-6 mt-6">
              <PromotersList />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6 mt-6">
              <ReportsList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleGuard>
  )
}

// Stats Card Component
function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// Activity Feed Component
function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching activities
    setTimeout(() => {
      setActivities([
        {
          id: 1,
          type: "contract_created",
          title: "New Contract Created",
          description: "Contract #12345 for Product X",
          timestamp: "2 hours ago",
        },
        {
          id: 2,
          type: "contract_approved",
          title: "Contract Approved",
          description: "Contract #12340 approved by Second Party",
          timestamp: "1 day ago",
        },
        {
          id: 3,
          type: "promoter_assigned",
          title: "Promoter Assigned",
          description: "John Doe assigned to Contract #12338",
          timestamp: "2 days ago",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 border-b pb-3 last:border-0">
          <div className="p-1.5 rounded-full bg-gray-100">
            {activity.type === "contract_created" && <PlusCircle className="h-4 w-4 text-green-500" />}
            {activity.type === "contract_approved" && <CheckCircle className="h-4 w-4 text-blue-500" />}
            {activity.type === "promoter_assigned" && <FileText className="h-4 w-4 text-amber-500" />}
          </div>
          <div>
            <p className="font-medium text-sm">{activity.title}</p>
            <p className="text-xs text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Contracts List Component
function ContractsList() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await contractApi.searchContracts({
          limit: 10,
          offset: 0,
        })
        setContracts(response.contracts || [])
      } catch (error) {
        console.error("Error fetching contracts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-40">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No contracts found</p>
          <Button asChild className="mt-4">
            <Link href="/company/contracts/create">Create New Contract</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Contracts</h2>
        <Button asChild>
          <Link href="/company/contracts/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Contract
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Contract ID</th>
                  <th className="text-left p-4 font-medium">Promoter</th>
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">{contract.id}</td>
                    <td className="p-4">{contract.promoter?.name || "N/A"}</td>
                    <td className="p-4">{contract.product?.name || "N/A"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          contract.status === "active"
                            ? "bg-green-100 text-green-800"
                            : contract.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {contract.status || "Draft"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/contracts/${contract.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Promoters List Component (placeholder)
function PromotersList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promoters Management</CardTitle>
        <CardDescription>Manage your promoters and assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Promoters management functionality will be implemented here.</p>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href="/company/promoters/create">Add New Promoter</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Reports List Component (placeholder)
function ReportsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>Generate and view reports</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Reporting functionality will be implemented here.</p>
      </CardContent>
      <CardFooter>
        <Button>Generate Report</Button>
      </CardFooter>
    </Card>
  )
}
