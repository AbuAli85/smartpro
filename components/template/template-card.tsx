"use client"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, FileText } from "lucide-react"
import type { ContractTemplate } from "@/types/template"

interface TemplateCardProps {
  template: ContractTemplate
  language: "en" | "ar"
}

export default function TemplateCard({ template, language }: TemplateCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{template.name}</CardTitle>
            <CardDescription className="mt-1">{template.description}</CardDescription>
          </div>
          <div className="flex space-x-1">
            {/*  Languages.map((lang) => (
              <Badge key={lang} variant="outline">
                {lang}
              </Badge>
            )) */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <CalendarIcon className="mr-1 h-4 w-4" />
          <span>
            Updated{" "}
            {formatDistanceToNow(new Date(template.updatedAt || template.createdAt || Date.now()), { addSuffix: true })}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button variant="default" className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
