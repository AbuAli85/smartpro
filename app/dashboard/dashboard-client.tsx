"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTranslations } from "@/utils/translations"
import { useAuth } from "@/contexts/auth-context"
import { FilePlus, FileText, LayoutTemplateIcon as Template, ChevronRight } from "lucide-react"
import type { Contract } from "@/services/contract-service"
import type { Template as TemplateType } from "@/services/template-service"
import type { Notification } from "@/services/notification-service"
import TemplateCard from "@/components/template/template-card"
import RealtimeNotificationCenter from "@/components/notification/realtime-notification-center"

interface DashboardClientProps {
  language: "en" | "ar"
  recentContracts: Contract[]
  recentContractsCount: number
  templates: TemplateType[]
  templatesCount: number
  notifications: Notification[]
  notificationsCount: number
}

export default function DashboardClient({
  language,
  recentContracts,
  recentContractsCount,
  templates,
  templatesCount,
  notifications,
  notificationsCount,
}: DashboardClientProps) {
  const t = getTranslations(language)
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  if (!user) return null

  return (
    <div className={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.dashboard || "Dashboard"}</h1>
          <p className="text-gray-500">
            {t.welcomeBack || "Welcome back"}, {user.email}
          </p>
        </div>

        <RealtimeNotificationCenter language={language} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">{t.overview || "Overview"}</TabsTrigger>
          <TabsTrigger value="contracts">{t.contracts || "Contracts"}</TabsTrigger>
          <TabsTrigger value="templates">{t.templates || "Templates"}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t.totalContracts || "Total Contracts"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{recentContractsCount}</div>
              </CardContent>
              <CardFooter>
                <Link href="/contracts" className="text-sm text-primary hover:underline flex items-center">
                  <span>{t.viewAll || "View all"}</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t.availableTemplates || "Available Templates"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{templatesCount}</div>
              </CardContent>
              <CardFooter>
                <Link href="/templates" className="text-sm text-primary hover:underline flex items-center">
                  <span>{t.viewAll || "View all"}</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t.notifications || "Notifications"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{notificationsCount}</div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-primary hover:underline flex items-center p-0"
                >
                  <span>{t.viewAll || "View all"}</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t.quickActions || "Quick Actions"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/contracts/new">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    <FilePlus className="h-10 w-10 text-primary mb-4" />
                    <CardTitle className="text-lg mb-2">{t.createNewContract || "Create New Contract"}</CardTitle>
                    <CardDescription>
                      {t.createNewContractDescription || "Start a new contract from scratch or using a template"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/templates">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    <Template className="h-10 w-10 text-primary mb-4" />
                    <CardTitle className="text-lg mb-2">{t.browseTemplates || "Browse Templates"}</CardTitle>
                    <CardDescription>
                      {t.browseTemplatesDescription || "Find and use pre-made contract templates"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/contracts">
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    <FileText className="h-10 w-10 text-primary mb-4" />
                    <CardTitle className="text-lg mb-2">{t.manageContracts || "Manage Contracts"}</CardTitle>
                    <CardDescription>
                      {t.manageContractsDescription || "View, edit and manage your existing contracts"}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Recent Templates */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t.recentTemplates || "Recent Templates"}</h2>
              <Link href="/templates">
                <Button variant="outline" size="sm">
                  {t.viewAll || "View all"}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.slice(0, 3).map((template) => (
                <TemplateCard key={template.id} template={template} language={language} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          {/* Contracts Tab Content */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t.yourContracts || "Your Contracts"}</h2>
            <Link href="/contracts/new">
              <Button>
                <FilePlus className="h-4 w-4 mr-2" />
                {t.createNewContract || "Create New Contract"}
              </Button>
            </Link>
          </div>

          {recentContracts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">{t.noContractsFound || "No contracts found"}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {t.createYourFirstContract || "Create your first contract to get started"}
                </p>
                <Link href="/contracts/new" className="mt-4 inline-block">
                  <Button>
                    <FilePlus className="h-4 w-4 mr-2" />
                    {t.createNewContract || "Create New Contract"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentContracts.map((contract) => (
                <Link key={contract.id} href={`/contracts/${contract.id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {contract.first_party_name} & {contract.second_party_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t.contractTypeOptions?.[
                              contract.contract_type.toLowerCase() as keyof typeof t.contractTypeOptions
                            ] || contract.contract_type}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {t.referenceNumber}: {contract.reference_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {contract.status}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(contract.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              <div className="text-center">
                <Link href="/contracts">
                  <Button variant="outline">{t.viewAllContracts || "View All Contracts"}</Button>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Templates Tab Content */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t.templates || "Templates"}</h2>
            <Link href="/templates/new">
              <Button>
                <Template className="h-4 w-4 mr-2" />
                {t.createTemplate || "Create Template"}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} language={language} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/templates">
              <Button variant="outline">{t.viewAllTemplates || "View All Templates"}</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
