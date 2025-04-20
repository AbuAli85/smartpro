"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTranslations } from "@/utils/translations"
import { Check, X, AlertTriangle } from "lucide-react"

export default function I18nQaChecker() {
  const [showChecker, setShowChecker] = useState(false)
  const [language, setLanguage] = useState<"en" | "ar">("en")

  const enTranslations = getTranslations("en")
  const arTranslations = getTranslations("ar")

  // Find missing translations
  const findMissingTranslations = () => {
    const missingInArabic: string[] = []

    // Check English keys that are missing in Arabic
    Object.keys(enTranslations).forEach((key) => {
      if (!(key in arTranslations)) {
        missingInArabic.push(key)
      }
    })

    return { missingInArabic }
  }

  const { missingInArabic } = findMissingTranslations()

  if (!showChecker) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setShowChecker(true)} className="bg-white shadow-md">
          <AlertTriangle className="h-4 w-4 mr-2" />
          i18n QA
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">i18n QA Checker</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowChecker(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Check for missing translations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant={language === "en" ? "default" : "outline"} size="sm" onClick={() => setLanguage("en")}>
              English
            </Button>
            <Button variant={language === "ar" ? "default" : "outline"} size="sm" onClick={() => setLanguage("ar")}>
              Arabic
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={missingInArabic.length === 0 ? "text-green-500" : "text-red-500"}>
                {missingInArabic.length === 0 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </div>
              <span className="text-sm">
                {missingInArabic.length === 0
                  ? "All English keys have Arabic translations"
                  : `${missingInArabic.length} English keys missing Arabic translations`}
              </span>
            </div>

            {missingInArabic.length > 0 && (
              <div className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                {missingInArabic.map((key) => (
                  <div key={key} className="mb-1">
                    <code className="bg-gray-200 px-1 rounded">{key}</code>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">Current language: {language === "en" ? "English" : "Arabic"}</div>
        </CardContent>
      </Card>
    </div>
  )
}
