"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Contract, Template } from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Loader2, FilterX, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Label } from "@/components/ui/card"

interface EnrichedContract extends Contract {
  templates: Pick<Template, "name"> | null // Assuming 'templates' is the related table name
  // If you have a profiles table linked to users:
  // profiles: Pick<Tables<'profiles'>, 'full_name'> | null;
}

export default function ContractHistoryTab() {
  const supabase = createClient()
  const [contracts, setContracts] = useState<EnrichedContract[]>([])
  const [allTemplates, setAllTemplates] = useState<Pick<Template, "id" | "name">[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("") // YYYY-MM-DD

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      // Fetch contracts with template names
      // Adjust the join if your related table for user names is different (e.g., 'profiles(full_name)')
      const { data: contractsData, error: contractsError } = await supabase
        .from("contracts")
        .select("*, templates(name)") // Fetches all columns from contracts and 'name' from related 'templates'
        .order("generated_at", { ascending: false })

      if (contractsError) {
        console.error("Error fetching contracts:", contractsError)
        setError(`Failed to load contracts: ${contractsError.message}`)
        setContracts([])
      } else {
        setContracts((contractsData as EnrichedContract[]) || [])
      }

      // Fetch all unique templates for filter dropdown
      const { data: templatesData, error: templatesError } = await supabase
        .from("templates")
        .select("id, name")
        .order("name")

      if (templatesError) {
        console.error("Error fetching templates for filter:", templatesError)
      } else {
        setAllTemplates(templatesData || [])
      }

      setIsLoading(false)
    }
    fetchData()
  }, [supabase])

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const generatedAtDate = contract.generated_at ? format(new Date(contract.generated_at), "yyyy-MM-dd") : ""
      const templateName = contract.templates?.name?.toLowerCase() || ""
      const contractFileName = contract.generated_file_name?.toLowerCase() || ""
      const lowerSearchTerm = searchTerm.toLowerCase()

      const matchesSearch =
        contractFileName.includes(lowerSearchTerm) ||
        templateName.includes(lowerSearchTerm) ||
        (contract.form_values && JSON.stringify(contract.form_values).toLowerCase().includes(lowerSearchTerm))

      const matchesTemplate = selectedTemplateFilter ? contract.template_id === selectedTemplateFilter : true
      const matchesDate = dateFilter ? generatedAtDate === dateFilter : true

      return matchesSearch && matchesTemplate && matchesDate
    })
  }, [contracts, searchTerm, selectedTemplateFilter, dateFilter])

  const handleDownload = async (contract: EnrichedContract) => {
    try {
      const { data, error } = await supabase.storage
        .from(contract.generated_file_bucket)
        .download(contract.generated_file_path)

      if (error) throw error
      if (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = contract.generated_file_name || "contract.docx"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
        toast({ title: "Download Started", description: contract.generated_file_name })
      }
    } catch (err: any) {
      console.error("Error downloading file:", err)
      toast({ title: "Download Failed", description: err.message, variant: "destructive" })
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedTemplateFilter("")
    setDateFilter("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading contract history...</p>
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500 text-center py-10">{error}</p>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Contracts</CardTitle>
          <CardDescription>Refine the list of contracts using the filters below.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="search-term">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-term"
                placeholder="Search by filename, template, content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="template-filter">Template</Label>
            <Select value={selectedTemplateFilter} onValueChange={setSelectedTemplateFilter}>
              <SelectTrigger id="template-filter">
                <SelectValue placeholder="All Templates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Templates</SelectItem>
                {allTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="date-filter">Generation Date</Label>
            <Input id="date-filter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
          <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
            <FilterX className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Contracts</CardTitle>
          <CardDescription>
            {filteredContracts.length > 0
              ? `Showing ${filteredContracts.length} of ${contracts.length} contracts.`
              : "No contracts found matching your criteria."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead className="hidden md:table-cell">Generated At</TableHead>
                  {/* <TableHead className="hidden lg:table-cell">Generated By</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium break-all">{contract.generated_file_name}</TableCell>
                    <TableCell>{contract.templates?.name || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {contract.generated_at ? format(new Date(contract.generated_at), "MMM d, yyyy HH:mm") : "N/A"}
                    </TableCell>
                    {/* <TableCell className="hidden lg:table-cell">
                      {contract.profiles?.full_name || contract.user_id.substring(0,8) + "..."}
                    </TableCell> */}
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(contract)}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && <p className="text-center text-muted-foreground py-6">No contracts to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
