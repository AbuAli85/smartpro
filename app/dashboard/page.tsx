import { Suspense } from "react"
import { getSupabaseServer } from "@/lib/supabase/server"
import { serverTemplateService } from "@/services/template-service"
import { serverContractService } from "@/services/contract-service"
import { serverNotificationService } from "@/services/notification-service"
import DashboardClient from "./dashboard-client"
import { Skeleton } from "@/components/ui/skeleton"

export default async function DashboardPage() {
  const supabase = getSupabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null // This should be handled by middleware
  }

  // Fetch initial data for the dashboard
  const userId = session.user.id

  // Get user profile to determine language preference
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("preferred_language")
    .eq("user_id", userId)
    .single()

  const language = (profile?.preferred_language || "en") as "en" | "ar"

  return (
    <main className="container mx-auto py-10 px-4">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={userId} language={language} />
      </Suspense>
    </main>
  )
}

async function DashboardContent({ userId, language }: { userId: string; language: "en" | "ar" }) {
  // Fetch data in parallel
  const [recentContractsPromise, templatesPromise, notificationsPromise] = await Promise.allSettled([
    serverContractService.getUserContracts(userId, 1, 5),
    serverTemplateService.getPublishedTemplates(1, 6),
    serverNotificationService.getUserNotifications(userId, 1, 5),
  ])

  // Extract data safely
  const recentContracts = recentContractsPromise.status === "fulfilled" ? recentContractsPromise.value.data : []
  const recentContractsCount = recentContractsPromise.status === "fulfilled" ? recentContractsPromise.value.count : 0

  const templates = templatesPromise.status === "fulfilled" ? templatesPromise.value.data : []
  const templatesCount = templatesPromise.status === "fulfilled" ? templatesPromise.value.count : 0

  const notifications = notificationsPromise.status === "fulfilled" ? notificationsPromise.value.data : []
  const notificationsCount = notificationsPromise.status === "fulfilled" ? notificationsPromise.value.count : 0

  return (
    <DashboardClient
      language={language}
      recentContracts={recentContracts}
      recentContractsCount={recentContractsCount}
      templates={templates}
      templatesCount={templatesCount}
      notifications={notifications}
      notificationsCount={notificationsCount}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
