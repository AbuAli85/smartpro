"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type Invoice = {
  id: string
  amount: number
  date: string
  status: "paid" | "pending"
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    // Fetch invoices from API
    // This is a placeholder, replace with actual API call
    setInvoices([
      { id: "1", amount: 100, date: "2023-06-01", status: "paid" },
      { id: "2", amount: 200, date: "2023-05-15", status: "pending" },
    ])
  }, [])

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Billing</h1>
      <div className="grid gap-6">
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader>
              <CardTitle>Invoice #{invoice.id}</CardTitle>
              <CardDescription>{invoice.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${invoice.amount}</p>
              <p className="text-muted-foreground">Status: {invoice.status}</p>
            </CardContent>
            <CardFooter>
              <Button>View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}

