"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { templateService, type Template } from "@/services/template-service"
import { usePagination } from "@/hooks/use-pagination"
import { Pagination } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Loader2 } from "lucide-react"
import { getTranslations } from "@/utils/translations"
import { LazyLoad } from "@/components/ui/lazy-load"
import TemplateCard from "@/components/template/template-card"

interface TemplateListProps {
  language: "en" | "ar"
  showOnlyPublished?: boolean
  initialTemplates?: Template[]
  initialCount?: number
}

export default function TemplateList({
  language,
  showOnlyPublished = false,
  initialTemplates = [],
  initialCount = 0,
}: TemplateListProps) {
  const t = getTranslations(language)
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Fetch function for pagination
  const fetchTemplates = async (page: number, pageSize: number) => {
    if (!user && !showOnlyPublished) {
      return { data: [], count: 0 }
    }

    if (searchQuery) {
      setIsSearching(true)
      try {
        return await templateService.searchTemplates(searchQuery, page, pageSize)
      } finally {
        setIsSearching(false)
      }
    }

    if (selectedCategories.length > 0) {
      // For simplicity, we're just using the first selected category
      // In a real app, you might want to implement a more complex filtering system
      return await templateService.getTemplatesByCategory(selectedCategories[0], page, pageSize)
    }

    if (showOnlyPublished) {
      return await templateService.getPublishedTemplates(page, pageSize)
    }

    return await templateService.getUserTemplates(user!.id, page, pageSize)
  }

  const {
    data: templates,
    total,
    page,
    totalPages,
    isLoading,
    goToPage,
    refresh,
  } = usePagination<Template>({
    initialData: initialTemplates,
    initialTotal: initialCount,
    fetchData: fetchTemplates,
  })

  // Handle search
  const handleSearch = () => {
    refresh()
  }

  // Handle category filter change
  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories)
    refresh()
  }

  return (
    <div className="space-y-6">
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchTemplates}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : t.search || "Search"}
          </Button>
        </div>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>{t.filterByCategory}</span>
          {selectedCategories.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
              {selectedCategories.length}
            </span>
          )}
        </Button>
      </div>

      {/* Templates grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-40">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">{t.noTemplatesFound}</p>
            <p className="text-sm text-gray-400 mt-1">{t.tryDifferentFilters}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <LazyLoad key={template.id} height={160}>
              <TemplateCard template={template} language={language} />
            </LazyLoad>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={goToPage}
          language={language}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
