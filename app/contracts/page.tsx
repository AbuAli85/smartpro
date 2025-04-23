"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Search, Filter } from "lucide-react"
import { Header } from "../components/header"
import { useLanguage } from "../contexts/language-context"
import { useQuery } from "@tanstack/react-query"
import { contractApi } from "@/app/lib/api-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// Define proper TypeScript types
type ContractData = {
  id: string
  created_at: string
  first_party: {
    name: string
    name_ar?: string
    crn?: string
    logo_url?: string
  }
  second_party: {
    name: string
    name_ar?: string
    crn?: string
  }
  promoter: {
    name: string
    name_ar?: string
    count?: number
  }
  product: {
    name: string
    name_ar?: string
  }
  start_date: string
  end_date: string
  status: string
}

export default function ContractsPage() {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({})
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Use React Query to fetch contracts
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contracts", debouncedSearchTerm, filters],
    queryFn: () =>
      contractApi.searchContracts({
        query: debouncedSearchTerm,
        filters,
        limit: 20,
        offset: 0,
      }),
    select: (data) => data.contracts as ContractData[],
  })

  // Helper function to get contract data safely
  const getContractValue = (contract: ContractData, field: string, lang = "en") => {
    switch (field) {
      case "first_party":
        return lang === "en" ? contract.first_party.name : contract.first_party.name_ar || contract.first_party.name
      case "second_party":
        return lang === "en" ? contract.second_party.name : contract.second_party.name_ar || contract.second_party.name
      case "promoter":
        return lang === "en" ? contract.promoter.name : contract.promoter.name_ar || contract.promoter.name
      case "product":
        return lang === "en" ? contract.product.name : contract.product.name_ar || contract.product.name
      default:
        return "—"
    }
  }

  // Helper function to get date range
  const getDateRange = (contract: ContractData) => {
    if (contract.start_date && contract.end_date) {
      return (
        <>
          {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
        </>
      )
    }
    return "—"
  }

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{language === "en" ? "Promoter Contracts" : "عقود المروجين"}</h1>
          <Link href="/admin/create" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            {language === "en" ? "Create New Contract" : "إنشاء عقد جديد"}
          </Link>
        </div>

        {/* Search and filter bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder={language === "en" ? "Search contracts..." : "البحث في العقود..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={18} />
            {language === "en" ? "Filters" : "تصفية"}
          </Button>
        </div>

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-white shadow-md rounded-lg p-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-red-500">{language === "en" ? "Error loading contracts" : "خطأ في تحميل العقود"}</p>
            <p className="text-gray-500">{(error as Error)?.message || "Unknown error"}</p>
          </div>
        ) : data?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">{language === "en" ? "No contracts found" : "لم يتم العثور على عقود"}</p>
            <Link
              href="/admin/create"
              className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              {language === "en" ? "Create Your First Contract" : "إنشاء عقدك الأول"}
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "en" ? "Contract ID" : "رقم العقد"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "en" ? "First Party" : "الطرف الأول"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "en" ? "Promoter" : "المروج"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "en" ? "Date Range" : "الفترة الزمنية"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "en" ? "Status" : "الحالة"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "en" ? "Actions" : "الإجراءات"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contract.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {contract.first_party.logo_url && (
                          <div className="flex-shrink-0 h-8 w-8 mr-3">
                            <img
                              src={contract.first_party.logo_url || "/placeholder.svg"}
                              alt="Company logo"
                              className="h-8 w-8 rounded-full"
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getContractValue(contract, "first_party", language)}
                          </div>
                          {contract.first_party.crn && (
                            <div className="text-xs text-gray-500">
                              {language === "en" ? "CRN: " : "رقم السجل التجاري: "}
                              {contract.first_party.crn}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getContractValue(contract, "promoter", language)}</div>
                      {contract.promoter.count && (
                        <div className="text-xs text-gray-500">
                          {language === "en" ? "Count: " : "العدد: "}
                          {contract.promoter.count}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDateRange(contract)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          contract.status === "active"
                            ? "bg-green-100 text-green-800"
                            : contract.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/contracts/${contract.id}`} className="text-primary hover:text-primary/80 mr-4">
                        {language === "en" ? "View" : "عرض"}
                      </Link>
                      <Link href={`/admin/edit/${contract.id}`} className="text-gray-600 hover:text-gray-900">
                        {language === "en" ? "Edit" : "تعديل"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
