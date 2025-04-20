"use client"

import { Globe } from "lucide-react"

interface LanguageToggleProps {
  language: "en" | "ar"
  setLanguage: (language: "en" | "ar") => void
}

export default function LanguageToggle({ language, setLanguage }: LanguageToggleProps) {
  return (
    <div className="flex items-center justify-end mb-4">
      <div className="relative inline-block">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span>{language === "en" ? "English" : "العربية"}</span>
          <svg
            className="h-4 w-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="absolute right-0 mt-1 w-40 bg-white border rounded-md shadow-lg z-10 hidden group-hover:block">
          <ul className="py-1">
            <li>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  language === "en" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                }`}
              >
                English
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setLanguage("ar")}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  language === "ar" ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                }`}
              >
                العربية
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
