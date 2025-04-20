"use client"

import { useState } from "react"
import { CheckCircle, XCircle, ClipboardList, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getTranslations } from "@/utils/translations"
import type { ContractTemplate } from "@/types/template"
import { ApprovalStatus } from "@/types/template"
import { approveTemplate, rejectTemplate } from "@/utils/template-storage"
import { useUser } from "@/contexts/user-context"
import { useNotifications } from "@/contexts/notification-context"
import { formatDate } from "@/utils/version-history"
import NotificationExpirationForm from "./notification-expiration-form"

interface ApprovalManagementDialogProps {
  language: "en" | "ar"
  template: ContractTemplate
  onApprovalAction: (updatedTemplate: ContractTemplate) => void
}

export default function ApprovalManagementDialog({
  language,
  template,
  onApprovalAction,
}: ApprovalManagementDialogProps) {
  const t = getTranslations(language)
  const { currentUser, isApprover } = useUser()
  const { addNotificationFromTemplate } = useNotifications()
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [expirationDate, setExpirationDate] = useState<string | undefined>(undefined)

  // Check if template can be approved/rejected
  const canManageApproval = isApprover && template.approvalStatus === ApprovalStatus.PendingApproval

  // Handle approve template
  const handleApprove = async () => {
    if (!currentUser) return

    setIsProcessing(true)
    try {
      const updatedTemplate = await approveTemplate(template.id, comments, currentUser.name)
      if (updatedTemplate) {
        // Add notification using template
        addNotificationFromTemplate(
          "template-approved",
          {
            templateName: template.name,
            approvedBy: currentUser.name,
          },
          {
            expiresAt: expirationDate,
            relatedItemId: template.id,
            relatedItemType: "template",
          },
        )

        onApprovalAction(updatedTemplate)
        setOpen(false)
      }
    } catch (error) {
      console.error("Error approving template:", error)

      // Add error notification
      addNotificationFromTemplate("general-error", {
        message: `Failed to approve template "${template.name}".`,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle reject template
  const handleReject = async () => {
    if (!currentUser || !comments.trim()) return

    setIsProcessing(true)
    try {
      const updatedTemplate = await rejectTemplate(template.id, comments, currentUser.name)
      if (updatedTemplate) {
        // Add notification using template
        addNotificationFromTemplate(
          "template-rejected",
          {
            templateName: template.name,
            rejectedBy: currentUser.name,
            rejectionReason: comments,
          },
          {
            expiresAt: expirationDate,
            relatedItemId: template.id,
            relatedItemType: "template",
          },
        )

        onApprovalAction(updatedTemplate)
        setOpen(false)
      }
    } catch (error) {
      console.error("Error rejecting template:", error)

      // Add error notification
      addNotificationFromTemplate("general-error", {
        message: `Failed to reject template "${template.name}".`,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // If not an approver and template is not pending approval, don't render
  if (!isApprover && template.approvalStatus !== ApprovalStatus.PendingApproval) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={canManageApproval ? "default" : "outline"} size="sm" className="flex items-center gap-1">
          <ClipboardList className="h-4 w-4" />
          <span>{canManageApproval ? t.reviewApproval : t.approvalStatus}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{canManageApproval ? t.reviewTemplateApproval : t.templateApprovalStatus}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t.templateDetails}</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium">{template.name}</p>
              <p className="text-sm text-gray-500">{template.description}</p>
            </div>
          </div>

          {/* Approval Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t.currentStatus}</h3>
            <div className="flex items-center gap-2">
              {template.approvalStatus === ApprovalStatus.Draft && (
                <div className="flex items-center gap-1 text-gray-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t.draft}</span>
                </div>
              )}
              {template.approvalStatus === ApprovalStatus.PendingApproval && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t.pendingApproval}</span>
                </div>
              )}
              {template.approvalStatus === ApprovalStatus.Approved && (
                <div className="flex items-center gap-1 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span>{t.approved}</span>
                </div>
              )}
              {template.approvalStatus === ApprovalStatus.Rejected && (
                <div className="flex items-center gap-1 text-red-500">
                  <XCircle className="h-4 w-4" />
                  <span>{t.rejected}</span>
                </div>
              )}
            </div>
          </div>

          {/* Approval History */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t.approvalHistory}</h3>
            <div className="bg-gray-50 p-3 rounded-md space-y-2">
              {template.approvalRequestedAt && (
                <div className="text-sm">
                  <span className="font-medium">{t.submittedBy}:</span> {template.approvalRequestedBy || t.unknown}{" "}
                  {t.on} {formatDate(template.approvalRequestedAt)}
                </div>
              )}
              {template.approvedAt && (
                <div className="text-sm">
                  <span className="font-medium">{t.approvedBy}:</span> {template.approvedBy || t.unknown} {t.on}{" "}
                  {formatDate(template.approvedAt)}
                </div>
              )}
              {template.rejectedAt && (
                <div className="text-sm">
                  <span className="font-medium">{t.rejectedBy}:</span> {template.rejectedBy || t.unknown} {t.on}{" "}
                  {formatDate(template.rejectedAt)}
                </div>
              )}
              {template.approvalComments && (
                <div className="text-sm mt-2">
                  <span className="font-medium">{t.comments}:</span>
                  <p className="mt-1 text-gray-600">{template.approvalComments}</p>
                </div>
              )}
            </div>
          </div>

          {/* Approval Actions - Only for approvers and pending templates */}
          {canManageApproval && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.approvalComments}</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full p-2 border rounded-md h-24"
                  placeholder={t.enterApprovalComments}
                />
                {template.approvalStatus === ApprovalStatus.PendingApproval && (
                  <p className="text-xs text-gray-500">{t.commentsRequiredForRejection}</p>
                )}
              </div>

              {/* Notification Expiration */}
              <NotificationExpirationForm language={language} onExpirationSet={setExpirationDate} />

              <div className="pt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isProcessing || !comments.trim()}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  <span>{t.reject}</span>
                </Button>
                <Button onClick={handleApprove} disabled={isProcessing} className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>{t.approve}</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
