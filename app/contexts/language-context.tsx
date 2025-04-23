"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with English, but check localStorage on client
  const [language, setLanguageState] = useState<Language>("en")
  const [isRTL, setIsRTL] = useState(false)

  // Load saved language preference from localStorage on client
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Update RTL state and document direction when language changes
  useEffect(() => {
    const isRightToLeft = language === "ar"
    setIsRTL(isRightToLeft)

    // Update document direction
    document.documentElement.dir = isRightToLeft ? "rtl" : "ltr"

    // Save preference to localStorage
    localStorage.setItem("language", language)
  }, [language])

  // Function to change language
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
  }

  return <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>{children}</LanguageContext.Provider>
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
