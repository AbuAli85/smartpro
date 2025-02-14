"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

type AnalyticsData = {
  name: string
  total: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData[]>([])

  useEffect(() => {
    // Fetch analytics data from API
    // This is a placeholder, replace with actual API call
    setData([
      { name: "Jan", total: 100 },
      { name: "Feb", total: 200 },
      { name: "Mar", total: 150 },
      { name: "Apr", total: 300 },
      { name: "May", total: 250 },
      { name: "Jun", total: 400 },
    ])
  }, [])

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

