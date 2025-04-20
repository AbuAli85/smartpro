"use client"

import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { ApprovalStatus } from "@/types/template"
import { getTranslations } from "@/utils/translations"

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus
  language: "en" | "ar"
  isPublished?: boolean
}

export default function ApprovalStatusBadge({ status, language, isPublished }: ApprovalStatusBadgeProps) {
  const t = getTranslations(language)

  switch (status) {
    case ApprovalStatus.Draft:
      return (
        <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 rounded-full px-2 py-1 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>{t.draft}</span>
        </div>
      )
    case ApprovalStatus.PendingApproval:
      return (
        <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-xs">
          <Clock className="h-3 w-3" />
          <span>{t.pendingApproval}</span>
        </div>
      )
    case ApprovalStatus.Approved:
      return (
        <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs">
          <CheckCircle className="h-3 w-3" />
          <span>{isPublished ? t.published : t.approved}</span>
        </div>
      )
    case ApprovalStatus.Rejected:
      return (
        <div className="inline-flex items-center gap-1 bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs">
          <XCircle className="h-3 w-3" />
          <span>{t.rejected}</span>
        </div>
      )
    default:
      return null
  }
}
