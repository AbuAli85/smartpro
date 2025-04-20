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
  ComposedChart,
} from "recharts"
import {
  BarChart2,
  LineChartIcon,
  RefreshCw,
  Loader2,
  Clock,
  Bell,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Define types for our metrics data
interface ReminderEffectivenessMetric {
  metric_name: string
  metric_value: number
}

interface ApproverPerformance {
  approver_id: string
  approver_name: string
  approver_email: string
  total_assigned: number
  total_completed: number
  completion_rate: number
  avg_response_time_hours: number
  response_after_reminder_rate: number
}

interface EffectivenessOverTime {
  period: string
  total_approvals: number
  approvals_with_reminders: number
  approvals_after_reminders: number
  effectiveness_rate: number
}

interface ApprovalResponseTime {
  item_type: string
  item_id: string
  item_name: string
  approver_name: string
  requested_at: string
  approved_at: string
  reminder_sent_at: string | null
  response_time_hours: number
  response_after_reminder: boolean
}

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function ReminderEffectivenessDashboard() {
  const [timeRange, setTimeRange] = useState("month")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  // State for metrics data
  const [effectivenessMetrics, setEffectivenessMetrics] = useState<ReminderEffectivenessMetric[]>([])
  const [approverPerformance, setApproverPerformance] = useState<ApproverPerformance[]>([])
  const [effectivenessOverTime, setEffectivenessOverTime] = useState<EffectivenessOverTime[]>([])
  const [responseTimes, setResponseTimes] = useState<ApprovalResponseTime[]>([])

  // Fetch all metrics data
  const fetchMetricsData = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()

      // Fetch reminder effectiveness metrics
      const { data: effectivenessData, error: effectivenessError } = await supabase.rpc("get_reminder_effectiveness", {
        time_range: timeRange,
      })

      if (effectivenessError) throw effectivenessError

      // Fetch approver performance metrics
      const { data: approverData, error: approverError } = await supabase.rpc("get_approver_performance", {
        time_range: timeRange,
      })

      if (approverError) throw approverError

      // Fetch effectiveness over time
      const { data: timeData, error: timeError } = await supabase.rpc("get_reminder_effectiveness_over_time", {
        time_range: timeRange,
      })

      if (timeError) throw timeError

      // Fetch approval response times
      const { data: responseData, error: responseError } = await supabase.rpc("get_approval_response_times", {
        time_range: timeRange,
      })

      if (responseError) throw responseError

      // Update state with fetched data
      setEffectivenessMetrics(effectivenessData || [])
      setApproverPerformance(approverData || [])
      setEffectivenessOverTime(timeData || [])
      setResponseTimes(responseData || [])
    } catch (error) {
      console.error("Error fetching metrics data:", error)
      toast({
        title: "Error",
        description: "Failed to load metrics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchMetricsData()
  }, [timeRange])

  // Helper function to get metric value
  const getMetricValue = (metricName: string): number => {
    const metric = effectivenessMetrics.find((m) => m.metric_name === metricName)
    return metric ? metric.metric_value : 0
  }

  // Format data for response time comparison chart
  const formatResponseTimeData = () => {
    return [
      {
        name: "With Reminder",
        hours: getMetricValue("avg_response_time_with_reminder_hours"),
      },
      {
        name: "Without Reminder",
        hours: getMetricValue("avg_response_time_without_reminder_hours"),
      },
    ]
  }

  // Format data for effectiveness pie chart
  const formatEffectivenessData = () => {
    const afterReminders = getMetricValue("approvals_after_reminders")
    const withReminders = getMetricValue("approvals_with_reminders")
    const noEffect = withReminders - afterReminders

    return [
      { name: "Effective", value: afterReminders },
      { name: "No Effect", value: noEffect },
    ]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <span>Reminder Effectiveness Dashboard</span>
            </CardTitle>
            <CardDescription>Track the effectiveness of approval reminders and response times</CardDescription>
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

            <Button variant="outline" size="icon" onClick={fetchMetricsData} disabled={isLoading}>
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
                      <p className="text-sm font-medium text-gray-500">Reminder Effectiveness</p>
                      <p className="text-3xl font-bold">{getMetricValue("reminder_effectiveness_rate")}%</p>
                      <p className="text-xs text-gray-500">Approvals after reminder</p>
                    </div>
                    <Bell className="h-8 w-8 text-blue-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Response Time Improvement</p>
                      <div className="flex items-center">
                        <p className="text-3xl font-bold">{getMetricValue("response_time_improvement_percent")}%</p>
                        {getMetricValue("response_time_improvement_percent") > 0 ? (
                          <TrendingUp className="h-5 w-5 ml-1 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 ml-1 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">With reminders vs. without</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
                      <p className="text-3xl font-bold">
                        {getMetricValue("avg_response_time_with_reminder_hours")} hrs
                      </p>
                      <p className="text-xs text-gray-500">With reminders</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Approvals</p>
                      <p className="text-3xl font-bold">{getMetricValue("total_approvals")}</p>
                      <p className="text-xs text-gray-500">
                        {getMetricValue("approvals_with_reminders")} with reminders
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-yellow-500 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Trends</span>
                </TabsTrigger>
                <TabsTrigger value="approvers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Approvers</span>
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Response Times</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Response Time Comparison Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Response Time Comparison</CardTitle>
                      <CardDescription>Average approval response time with and without reminders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={formatResponseTimeData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                            <Tooltip formatter={(value) => [`${value} hours`, "Response Time"]} />
                            <Legend />
                            <Bar dataKey="hours" name="Response Time (hours)" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reminder Effectiveness Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Reminder Effectiveness</CardTitle>
                      <CardDescription>Proportion of approvals that occurred after reminders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={formatEffectivenessData()}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {formatEffectivenessData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} approvals`, ""]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Trends Tab */}
              <TabsContent value="trends">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reminder Effectiveness Over Time</CardTitle>
                    <CardDescription>Tracking approval rates and reminder effectiveness</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={effectivenessOverTime}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis yAxisId="left" label={{ value: "Count", angle: -90, position: "insideLeft" }} />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{ value: "Rate (%)", angle: 90, position: "insideRight" }}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="total_approvals" name="Total Approvals" fill="#8884d8" />
                          <Bar yAxisId="left" dataKey="approvals_with_reminders" name="With Reminders" fill="#82ca9d" />
                          <Bar
                            yAxisId="left"
                            dataKey="approvals_after_reminders"
                            name="After Reminders"
                            fill="#ffc658"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="effectiveness_rate"
                            name="Effectiveness Rate (%)"
                            stroke="#ff7300"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Approvers Tab */}
              <TabsContent value="approvers">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Approver Performance</CardTitle>
                    <CardDescription>Response times and effectiveness by approver</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Approver</TableHead>
                            <TableHead>Assigned</TableHead>
                            <TableHead>Completed</TableHead>
                            <TableHead>Completion Rate</TableHead>
                            <TableHead>Avg. Response Time</TableHead>
                            <TableHead>After Reminder Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approverPerformance.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                No approver data available for the selected time period
                              </TableCell>
                            </TableRow>
                          ) : (
                            approverPerformance.map((approver) => (
                              <TableRow key={approver.approver_id}>
                                <TableCell>
                                  <div className="font-medium">{approver.approver_name}</div>
                                  <div className="text-xs text-gray-500">{approver.approver_email}</div>
                                </TableCell>
                                <TableCell>{approver.total_assigned}</TableCell>
                                <TableCell>{approver.total_completed}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      approver.completion_rate >= 80
                                        ? "default"
                                        : approver.completion_rate >= 50
                                          ? "outline"
                                          : "destructive"
                                    }
                                  >
                                    {approver.completion_rate}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-gray-500" />
                                    <span>{approver.avg_response_time_hours} hrs</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={approver.response_after_reminder_rate >= 70 ? "default" : "outline"}
                                    className={approver.response_after_reminder_rate >= 70 ? "bg-green-500" : ""}
                                  >
                                    {approver.response_after_reminder_rate}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Response Times Tab */}
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detailed Response Times</CardTitle>
                    <CardDescription>Individual approval response times with reminder status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Approver</TableHead>
                            <TableHead>Requested</TableHead>
                            <TableHead>Response Time</TableHead>
                            <TableHead>Reminder</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {responseTimes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                No response time data available for the selected time period
                              </TableCell>
                            </TableRow>
                          ) : (
                            responseTimes.map((item, index) => (
                              <TableRow key={`${item.item_type}-${item.item_id}-${index}`}>
                                <TableCell>
                                  <div className="font-medium">{item.item_name}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {item.item_type === "template" ? "Template" : "Contract"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{item.approver_name}</TableCell>
                                <TableCell>{new Date(item.requested_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-gray-500" />
                                    <span>{item.response_time_hours} hrs</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {item.reminder_sent_at ? (
                                    item.response_after_reminder ? (
                                      <Badge className="bg-green-500">Effective</Badge>
                                    ) : (
                                      <Badge variant="outline">Sent</Badge>
                                    )
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-100">
                                      None
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
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
