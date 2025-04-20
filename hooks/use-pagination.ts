"use client"

import { useState } from "react"

interface UsePaginationProps<T> {
  initialData?: T[]
  initialTotal?: number
  initialPage?: number
  initialPageSize?: number
  fetchData: (page: number, pageSize: number) => Promise<{ data: T[]; count: number }>
}

export function usePagination<T>({
  initialData = [],
  initialTotal = 0,
  initialPage = 1,
  initialPageSize = 10,
  fetchData,
}: UsePaginationProps<T>) {
  const [data, setData] = useState<T[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  const loadPage = async (newPage: number) => {
    if (newPage < 1 || (totalPages > 0 && newPage > totalPages)) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchData(newPage, pageSize)
      setData(result.data)
      setTotal(result.count || 0)
      setPage(newPage)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred while fetching data"))
    } finally {
      setIsLoading(false)
    }
  }

  const nextPage = () => {
    if (page < totalPages) {
      loadPage(page + 1)
    }
  }

  const prevPage = () => {
    if (page > 1) {
      loadPage(page - 1)
    }
  }

  const goToPage = (newPage: number) => {
    loadPage(newPage)
  }

  const changePageSize = async (newPageSize: number) => {
    setPageSize(newPageSize)
    // Reset to first page when changing page size
    loadPage(1)
  }

  const refresh = () => {
    loadPage(page)
  }

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    error,
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    refresh,
  }
}
