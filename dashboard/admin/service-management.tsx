"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Plus } from "lucide-react"

interface Service {
  id: string
  name: string
  provider: string
  category: string
  status: "active" | "inactive" | "pending"
  price: number
}

export function ServiceManagement() {
  const [services] = useState<Service[]>([
    {
      id: "1",
      name: "Business Registration",
      provider: "Legal Services Inc.",
      category: "Legal",
      status: "active",
      price: 299,
    },
    {
      id: "2",
      name: "Tax Consultation",
      provider: "Tax Experts Ltd.",
      category: "Finance",
      status: "active",
      price: 199,
    },
    // Add more sample services as needed
  ])

  const getStatusColor = (status: Service["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search services..." className="w-[300px]" />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.provider}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                </TableCell>
                <TableCell>${service.price}</TableCell>
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

