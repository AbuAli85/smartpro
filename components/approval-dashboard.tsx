"use client"

import { useState, useEffect } from "react"
import { ClipboardList, CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTranslations } from "@/utils/translations"
import { ApprovalStatus, type ContractTemplate } from "@/types/template"
import { getCustomTemplates } from "@/utils/template-storage"
import { useUser } from "@/contexts/user-context"
import ApprovalManagementDialog from "./approval-management-dialog"
import ApprovalStatusBadge from "./approval-status-badge"
import ReadReceiptAnalytics from "./read-receipt-analytics"
import { formatDate } from "@/utils/version-history"

interface ApprovalDashboardProps {
  language: "en" | "ar"
  onTemplateUpdated: (template: ContractTemplate) => void
}

export default function ApprovalDashboard({ language, onTemplateUpdated }: ApprovalDashboardProps) {
  const t = getTranslations(language)
  const { isApprover } = useUser()
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<ContractTemplate[]>([])
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")

  // Load templates
  useEffect(() => {
    const allTemplates = getCustomTemplates()
    setTemplates(allTemplates)

    // Initial filtering
    filterTemplates(allTemplates, activeTab, searchQuery)
  }, [activeTab, searchQuery])

  // Filter templates based on tab and search query
  const filterTemplates = (templateList: ContractTemplate[], tab: string, query: string) => {
    let filtered = [...templateList]

    // Filter by tab
    switch (tab) {
      case "pending":
        filtered = filtered.filter((t) => t.approvalStatus === ApprovalStatus.PendingApproval)
        break
      case "approved":
        filtered = filtered.filter((t) => t.approvalStatus === ApprovalStatus.Approved)
        break
      case "rejected":
        filtered = filtered.filter((t) => t.approvalStatus === ApprovalStatus.Rejected)
        break
      case "draft":
        filtered = filtered.filter((t) => t.approvalStatus === ApprovalStatus.Draft)
        break
      default:
        break
    }

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(lowerQuery) ||
          t.description.toLowerCase().includes(lowerQuery) ||
          t.category.toLowerCase().includes(lowerQuery),
      )
    }

    setFilteredTemplates(filtered)
  }

  // Handle template update
  const handleTemplateUpdated = (updatedTemplate: ContractTemplate) => {
    // Update templates list
    const updatedTemplates = templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
    setTemplates(updatedTemplates)

    // Re-filter templates
    filterTemplates(updatedTemplates, activeTab, searchQuery)

    // Notify parent
    onTemplateUpdated(updatedTemplate)
  }

  // If not an approver, don't show the dashboard
  if (!isApprover) return null

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {t.approvalDashboard}
        </h2>

        <ReadReceiptAnalytics language={language} />
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchTemplates}
            className="w-full p-2 pl-8 border rounded-md"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">{t.clear}</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{t.pending}</span>
            <span className="ml-1 bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-xs">
              {templates.filter((t) => t.approvalStatus === ApprovalStatus.PendingApproval).length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>{t.approved}</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            <span>{t.rejected}</span>
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>{t.draft}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">{t.noTemplatesFound}</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.name}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.category}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.requestedBy}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.requestedOn}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.status}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.categoryNames?.[template.category as keyof typeof t.categoryNames] || template.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.approvalRequestedBy || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.approvalRequestedAt ? formatDate(template.approvalRequestedAt) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ApprovalStatusBadge
                          status={template.approvalStatus}
                          language={language}
                          isPublished={template.isPublished}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ApprovalManagementDialog
                          language={language}
                          template={template}
                          onApprovalAction={handleTemplateUpdated}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
