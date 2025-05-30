import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Template } from "@/types"
import ContractGeneratorForm from "./contract-generator-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ListChecks, BarChart2 } from "lucide-react"
import ContractHistoryTab from "./contract-history-tab" // Import the new component

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const { data: templatesData, error: templatesError } = await supabase
    .from("templates")
    .select("*")
    .order("name", { ascending: true })

  if (templatesError) {
    console.error("Error fetching templates:", templatesError)
    return <p className="text-red-500">Error loading contract templates: {templatesError.message}</p>
  }

  const templates: Template[] = templatesData || []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Contract Dashboard</h1>
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl">
          <TabsTrigger value="generator">
            <FileText className="mr-2 h-4 w-4" /> Contract Generator
          </TabsTrigger>
          <TabsTrigger value="history">
            <ListChecks className="mr-2 h-4 w-4" /> Contract History
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart2 className="mr-2 h-4 w-4" /> Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generator" className="mt-6">
          <ContractGeneratorForm templates={templates} />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <ContractHistoryTab /> {/* Render the new component here */}
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          {/* Placeholder for Reports Component */}
          <p className="text-muted-foreground">Reports will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
