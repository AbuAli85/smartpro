"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, RefreshCw, CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ApprovalStatus } from "@/types/template"

interface Template {
  id: string
  name: string
  description: string | null
  category: string
  approval_status: string
  approval_requested_at: string | null
  approval_requested_by: string | null
  created_by: string
  created_at: string
}

export default function TemplateApprovals({ adminId }: { adminId: string }) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Fetch pending templates
  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from("templates")
        .select(
          "id, name, description, category, approval_status, approval_requested_at, approval_requested_by, created_by, created_at",
        )
        .order("approval_requested_at", { ascending: false })

      if (error) {
        throw error
      }

      setTemplates(data || [])
      setFilteredTemplates(data || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchTemplates()
  }, [])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTemplates(templates)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = templates.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          (template.description && template.description.toLowerCase().includes(query)) ||
          template.category.toLowerCase().includes(query) ||
          template.approval_status.toLowerCase().includes(query),
      )
      setFilteredTemplates(filtered)
    }
  }, [searchQuery, templates])

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case ApprovalStatus.Approved.toLowerCase():
        return (
          <Badge variant="default" className="bg-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        )
      case ApprovalStatus.Rejected.toLowerCase():
        return (
          <Badge variant="default" className="bg-red-500 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      case ApprovalStatus.PendingApproval.toLowerCase():
        return (
          <Badge variant="default" className="bg-yellow-500 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> Draft
          </Badge>
        )
    }
  }

  // Handle template approval
  const handleApprove = async (templateId: string) => {
    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase
        .from("templates")
        .update({
          approval_status: ApprovalStatus.Approved,
          approved_at: new Date().toISOString(),
          approved_by: adminId,
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", templateId)

      if (error) {
        throw error
      }

      toast({
        title: "Template approved",
        description: "The template has been approved and published.",
        variant: "default",
      })

      fetchTemplates()
    } catch (error) {
      console.error("Error approving template:", error)
      toast({
        title: "Error",
        description: "Failed to approve template. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle template rejection
  const handleReject = async (templateId: string) => {
    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase
        .from("templates")
        .update({
          approval_status: ApprovalStatus.Rejected,
          rejected_at: new Date().toISOString(),
          rejected_by: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", templateId)

      if (error) {
        throw error
      }

      toast({
        title: "Template rejected",
        description: "The template has been rejected.",
        variant: "default",
      })

      fetchTemplates()
    } catch (error) {
      console.error("Error rejecting template:", error)
      toast({
        title: "Error",
        description: "Failed to reject template. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span>Template Approvals</span>
        </CardTitle>
        <CardDescription>Review and manage template approval requests</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline" size="sm" onClick={fetchTemplates} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
            <p>No templates found matching your search criteria.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell>{getStatusBadge(template.approval_status)}</TableCell>
                    <TableCell>{template.approval_requested_by || template.created_by}</TableCell>
                    <TableCell>{formatDate(template.approval_requested_at || template.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {template.approval_status.toLowerCase() === ApprovalStatus.PendingApproval.toLowerCase() ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(template.id)}
                            className="text-red-500 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(template.id)}
                            className="text-green-500 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // View template details
                            // This would typically navigate to template details page
                            // or open a modal with template details
                            toast({
                              title: "View Template",
                              description: `Viewing details for ${template.name}`,
                            })
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
