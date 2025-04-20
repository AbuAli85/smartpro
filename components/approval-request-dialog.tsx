"use client"

import { useState } from "react"
import { ClipboardCheck, Send } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getTranslations } from "@/utils/translations"
import type { ContractTemplate } from "@/types/template"
import { ApprovalStatus } from "@/types/template"
import { submitTemplateForApproval } from "@/utils/template-storage"
import { useUser } from "@/contexts/user-context"
import { useNotifications } from "@/contexts/notification-context"
import NotificationExpirationForm from "./notification-expiration-form"

interface ApprovalRequestDialogProps {
  language: "en" | "ar"
  template: ContractTemplate
  onRequestSubmitted: (updatedTemplate: ContractTemplate) => void
}

export default function ApprovalRequestDialog({ language, template, onRequestSubmitted }: ApprovalRequestDialogProps) {
  const t = getTranslations(language)
  const { currentUser } = useUser()
  const { addNotificationFromTemplate } = useNotifications()
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expirationDate, setExpirationDate] = useState<string | undefined>(undefined)

  // Check if template can be submitted for approval
  const canSubmitForApproval =
    template.approvalStatus === ApprovalStatus.Draft || template.approvalStatus === ApprovalStatus.Rejected

  // Handle submit for approval
  const handleSubmitForApproval = async () => {
    if (!currentUser) return

    setIsSubmitting(true)
    try {
      const updatedTemplate = await submitTemplateForApproval(template.id, currentUser.name)
      if (updatedTemplate) {
        // Add notification using template
        addNotificationFromTemplate(
          "template-submitted",
          {
            templateName: template.name,
            submittedBy: currentUser.name,
          },
          {
            expiresAt: expirationDate,
            relatedItemId: template.id,
            relatedItemType: "template",
          },
        )

        onRequestSubmitted(updatedTemplate)
        setOpen(false)
      }
    } catch (error) {
      console.error("Error submitting template for approval:", error)

      // Add error notification
      addNotificationFromTemplate("general-error", {
        message: `Failed to submit template "${template.name}" for approval.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canSubmitForApproval) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <ClipboardCheck className="h-4 w-4" />
          <span>{t.submitForApproval}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.submitTemplateForApproval}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t.templateDetails}</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium">{template.name}</p>
              <p className="text-sm text-gray-500">{template.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.additionalComments}</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2 border rounded-md h-24"
              placeholder={t.enterCommentsForApprovers}
            />
          </div>

          {/* Notification Expiration */}
          <NotificationExpirationForm language={language} onExpirationSet={setExpirationDate} />

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSubmitForApproval} disabled={isSubmitting} className="flex items-center gap-1">
              {isSubmitting ? (
                <span>{t.submitting}</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{t.submitForApproval}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
