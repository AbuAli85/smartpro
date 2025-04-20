"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  BarChart2,
  PieChartIcon,
  LineChartIcon,
  RefreshCw,
  Loader2,
  TrendingUp,
  Clock,
  Users,
  FileText,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Define types for our analytics data
interface ContractSubmissionData {
  period: string
  count: number
}

interface TemplateUsageData {
  template_name: string
  usage_count: number
}

interface ApprovalDurationData {
  template_type: string
  avg_duration_hours: number
}

interface UserActivityData {
  role: string
  activity_count: number
}

interface AnalyticsData {
  contractSubmissions: ContractSubmissionData[]
  templateUsage: TemplateUsageData[]
  approvalDuration: ApprovalDurationData[]
  userActivity: UserActivityData[]
}

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    contractSubmissions: [],
    templateUsage: [],
    approvalDuration: [],
    userActivity: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("month")
  const { toast } = useToast()

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()

      // Fetch contract submissions over time
      const { data: contractData, error: contractError } = await supabase.rpc("get_contract_submissions_over_time", {
        time_range: timeRange,
      })

      if (contractError) throw contractError

      // Fetch template usage
      const { data: templateData, error: templateError } = await supabase.rpc("get_most_used_templates", {
        limit_count: 10,
      })

      if (templateError) throw templateError

      // Fetch approval duration
      const { data: approvalData, error: approvalError } = await supabase.rpc("get_average_approval_duration")

      if (approvalError) throw approvalError

      // Fetch user activity by role
      const { data: activityData, error: activityError } = await supabase.rpc("get_activity_by_role", {
        time_range: timeRange,
      })

      if (activityError) throw activityError

      setAnalyticsData({
        contractSubmissions: contractData || [],
        templateUsage: templateData || [],
        approvalDuration: approvalData || [],
        userActivity: activityData || [],
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  // Format data for charts
  const formatContractData = () => {
    return analyticsData.contractSubmissions.map((item) => ({
      ...item,
      count: Number(item.count),
    }))
  }

  const formatTemplateData = () => {
    return analyticsData.templateUsage.map((item) => ({
      ...item,
      usage_count: Number(item.usage_count),
    }))
  }

  const formatApprovalData = () => {
    return analyticsData.approvalDuration.map((item) => ({
      ...item,
      avg_duration_hours: Number(item.avg_duration_hours),
    }))
  }

  const formatActivityData = () => {
    return analyticsData.userActivity.map((item) => ({
      ...item,
      activity_count: Number(item.activity_count),
    }))
  }

  // Summary metrics
  const getTotalContracts = () => {
    return analyticsData.contractSubmissions.reduce((sum, item) => sum + Number(item.count), 0)
  }

  const getAverageApprovalTime = () => {
    if (analyticsData.approvalDuration.length === 0) return 0
    const sum = analyticsData.approvalDuration.reduce((acc, item) => acc + Number(item.avg_duration_hours), 0)
    return Math.round(sum / analyticsData.approvalDuration.length)
  }

  const getMostUsedTemplate = () => {
    if (analyticsData.templateUsage.length === 0) return "None"
    return analyticsData.templateUsage.reduce((prev, current) =>
      Number(prev.usage_count) > Number(current.usage_count) ? prev : current,
    ).template_name
  }

  const getMostActiveRole = () => {
    if (analyticsData.userActivity.length === 0) return "None"
    return analyticsData.userActivity.reduce((prev, current) =>
      Number(prev.activity_count) > Number(current.activity_count) ? prev : current,
    ).role
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              <span>Analytics Dashboard</span>
            </CardTitle>
            <CardDescription>Key metrics and trends for the contract management system</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={fetchAnalyticsData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Contracts</p>
                      <p className="text-3xl font-bold">{getTotalContracts()}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg. Approval Time</p>
                      <p className="text-3xl font-bold">{getAverageApprovalTime()} hrs</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Most Used Template</p>
                      <p className="text-xl font-bold truncate max-w-[150px]">{getMostUsedTemplate()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Most Active Role</p>
                      <p className="text-3xl font-bold">{getMostActiveRole()}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="submissions" className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="submissions" className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Submissions</span>
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Templates</span>
                </TabsTrigger>
                <TabsTrigger value="approvals" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Approvals</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
              </TabsList>

              {/* Contract Submissions Chart */}
              <TabsContent value="submissions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contract Submissions Over Time</CardTitle>
                    <CardDescription>
                      Number of contracts submitted per{" "}
                      {timeRange === "week"
                        ? "day"
                        : timeRange === "month"
                          ? "week"
                          : timeRange === "quarter"
                            ? "month"
                            : "quarter"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ChartContainer
                        config={{
                          count: {
                            label: "Submissions",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={formatContractData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="count"
                              name="Submissions"
                              stroke="var(--color-count)"
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Template Usage Chart */}
              <TabsContent value="templates">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Used Templates</CardTitle>
                    <CardDescription>Top 10 templates by usage count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatTemplateData()} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="template_name" type="category" width={150} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="usage_count" name="Usage Count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Approval Duration Chart */}
              <TabsContent value="approvals">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Average Approval Duration</CardTitle>
                    <CardDescription>Average time (in hours) for approvals by template type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatApprovalData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="template_type" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="avg_duration_hours" name="Average Duration (hours)" fill="#00C49F" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Activity Chart */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity by Role</CardTitle>
                    <CardDescription>Distribution of system activity by user role</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={formatActivityData()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="activity_count"
                            nameKey="role"
                          >
                            {formatActivityData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} actions`, "Activity Count"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}
