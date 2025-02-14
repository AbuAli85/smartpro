"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2 } from "lucide-react"

interface Subscription {
  id: string
  user: string
  plan: string
  status: "active" | "expired" | "cancelled"
  startDate: string
  endDate: string
  amount: number
}

export function SubscriptionManagement() {
  const [subscriptions] = useState<Subscription[]>([
    {
      id: "1",
      user: "John Doe",
      plan: "Business Pro",
      status: "active",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      amount: 299,
    },
    {
      id: "2",
      user: "Jane Smith",
      plan: "Enterprise",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2025-01-14",
      amount: 499,
    },
    // Add more sample subscriptions as needed
  ])

  const getStatusColor = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "expired":
        return "bg-red-500"
      case "cancelled":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search subscriptions..." className="w-[300px]" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>{subscription.user}</TableCell>
                <TableCell>{subscription.plan}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(subscription.status)}>{subscription.status}</Badge>
                </TableCell>
                <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
                <TableCell>${subscription.amount}/month</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

