"use client"

import type React from "react"

import { useState } from "react"
import { FileText, Briefcase, Wrench, Users, Scale, DollarSign, Home, MoreHorizontal, Filter } from "lucide-react"
import { templateCategories } from "@/types/template"
import { getTranslations } from "@/utils/translations"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CategoryFilterProps {
  language: "en" | "ar"
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
}

// Map of category icons
const categoryIcons: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Scale: <Scale className="h-4 w-4" />,
  DollarSign: <DollarSign className="h-4 w-4" />,
  Home: <Home className="h-4 w-4" />,
  MoreHorizontal: <MoreHorizontal className="h-4 w-4" />,
}

export default function CategoryFilter({ language, selectedCategories, onCategoryChange }: CategoryFilterProps) {
  const t = getTranslations(language)
  const [open, setOpen] = useState(false)

  // Toggle a category selection
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId))
    } else {
      onCategoryChange([...selectedCategories, categoryId])
    }
  }

  // Select all categories
  const selectAllCategories = () => {
    onCategoryChange(templateCategories.map((cat) => cat.id))
  }

  // Clear all selected categories
  const clearCategories = () => {
    onCategoryChange([])
  }

  return (
    <div className="mb-4">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>{t.filterByCategory}</span>
            {selectedCategories.length > 0 && (
              <span className="ml-1 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">
                {selectedCategories.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>{t.categories}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {templateCategories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.id}
              checked={selectedCategories.includes(category.id)}
              onCheckedChange={() => toggleCategory(category.id)}
              className="flex items-center gap-2"
            >
              {categoryIcons[category.icon as keyof typeof categoryIcons]}
              <span>{t.categoryNames?.[category.id as keyof typeof t.categoryNames] || category.name}</span>
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <div className="p-2 flex justify-between">
            <Button variant="ghost" size="sm" onClick={selectAllCategories} className="text-xs">
              {t.selectAll}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearCategories} className="text-xs">
              {t.clearAll}
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Display selected category pills */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map((categoryId) => {
            const category = templateCategories.find((c) => c.id === categoryId)
            if (!category) return null

            return (
              <div
                key={categoryId}
                className="flex items-center gap-1 bg-blue-50 text-blue-800 rounded-full px-3 py-1 text-xs"
              >
                {categoryIcons[category.icon as keyof typeof categoryIcons]}
                <span>{t.categoryNames?.[category.id as keyof typeof t.categoryNames] || category.name}</span>
                <button onClick={() => toggleCategory(categoryId)} className="ml-1 hover:text-blue-600">
                  <span className="sr-only">{t.remove}</span>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}

          {selectedCategories.length > 1 && (
            <button onClick={clearCategories} className="text-xs text-gray-500 hover:text-gray-700 underline">
              {t.clearAll}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
