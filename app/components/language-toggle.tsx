"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/app/contexts/language-context"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage} className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <span>{language === "en" ? "العربية" : "English"}</span>
    </Button>
  )
}
