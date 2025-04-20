"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SkeletonDashboard } from "@/components/ui/skeleton-loader"
import { AlertTriangle, Activity, Clock, Zap } from "lucide-react"

// Mock data - in a real app, this would come from your analytics API
const performanceData = [
  { page: "/", fcp: 1200, lcp: 2500, cls: 0.05, fid: 100 },
  { page: "/dashboard", fcp: 1500, lcp: 3000, cls: 0.08, fid: 150 },
  { page: "/contracts", fcp: 1300, lcp: 2800, cls: 0.03, fid: 120 },
  { page: "/templates", fcp: 1400, lcp: 2900, cls: 0.06, fid: 130 },
  { page: "/admin", fcp: 1600, lcp: 3200, cls: 0.09, fid: 180 },
]

// Error data - in a real app, this would come from Sentry API
const errorData = [
  { date: "Mon", count: 5, users: 3 },
  { date: "Tue", count: 8, users: 4 },
  { date: "Wed", count: 3, users: 2 },
  { date: "Thu", count: 12, users: 7 },
  { date: "Fri", count: 4, users: 3 },
  { date: "Sat", count: 2, users: 1 },
  { date: "Sun", count: 1, users: 1 },
]

export default function MonitoringDashboard() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("performance")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <SkeletonDashboard />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <span>Monitoring Dashboard</span>
        </CardTitle>
        <CardDescription>Track application performance and error metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Clock className="h-4 w-4" />
                    <p className="text-sm font-medium">FCP</p>
                  </div>
                  <p className="text-2xl font-bold">1.4s</p>
                  <p className="text-xs text-gray-500">First Contentful Paint</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 text-red-500 mb-1">
                    <Clock className="h-4 w-4" />
                    <p className="text-sm font-medium">LCP</p>
                  </div>
                  <p className="text-2xl font-bold">2.9s</p>
                  <p className="text-xs text-gray-500">Largest Contentful Paint</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 text-green-500 mb-1">
                    <Zap className="h-4 w-4" />
                    <p className="text-sm font-medium">FID</p>
                  </div>
                  <p className="text-2xl font-bold">130ms</p>
                  <p className="text-xs text-gray-500">First Input Delay</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 text-blue-500 mb-1">
                    <Activity className="h-4 w-4" />
                    <p className="text-sm font-medium">CLS</p>
                  </div>
                  <p className="text-2xl font-bold">0.06</p>
                  <p className="text-xs text-gray-500">Cumulative Layout Shift</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Core Web Vitals by Page</CardTitle>
                <CardDescription>Performance metrics across different pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      fcp: {
                        label: "FCP (ms)",
                        color: "hsl(var(--chart-1))",
                      },
                      lcp: {
                        label: "LCP (ms)",
                        color: "hsl(var(--chart-2))",
                      },
                      fid: {
                        label: "FID (ms)",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="page" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="fcp" name="FCP (ms)" fill="var(--color-fcp)" />
                        <Bar dataKey="lcp" name="LCP (ms)" fill="var(--color-lcp)" />
                        <Bar dataKey="fid" name="FID (ms)" fill="var(--color-fid)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 text-red-500 mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm font-medium">Total Errors</p>
                  </div>
                  <p className="text-2xl font-bold">35</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm font-medium">Affected Users</p>
                  </div>
                  <p className="text-2xl font-bold">21</p>
                  <p className="text-xs text-gray-500">Unique users impacted</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 text-green-500 mb-1">
                    <Activity className="h-4 w-4" />
                    <p className="text-sm font-medium">Error Rate</p>
                  </div>
                  <p className="text-2xl font-bold">0.8%</p>
                  <p className="text-xs text-gray-500">Of total sessions</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Error Trends</CardTitle>
                <CardDescription>Daily error count and affected users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Error Count",
                        color: "hsl(var(--chart-1))",
                      },
                      users: {
                        label: "Affected Users",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={errorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="count" name="Error Count" fill="var(--color-count)" />
                        <Bar dataKey="users" name="Affected Users" fill="var(--color-users)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
