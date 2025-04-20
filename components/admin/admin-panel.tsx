"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserRoleManagement from "@/components/admin/user-role-management"
import TemplateApprovals from "@/components/admin/template-approvals"
import SystemSettings from "@/components/admin/system-settings"
import ReminderNotificationPanel from "@/components/admin/reminder-notification-panel"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import ReminderEffectivenessDashboard from "@/components/admin/reminder-effectiveness-dashboard"
import { useToast } from "@/hooks/use-toast"
import { Users, FileText, Settings, Bell, BarChart2, LineChart } from "lucide-react"

export default function AdminPanel({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("analytics")
  const { toast } = useToast()

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-8">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Reminders</span>
          </TabsTrigger>
          <TabsTrigger value="effectiveness" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Effectiveness</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users & Roles</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <ReminderNotificationPanel />
        </TabsContent>

        <TabsContent value="effectiveness" className="space-y-4">
          <ReminderEffectivenessDashboard />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserRoleManagement adminId={userId} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplateApprovals adminId={userId} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SystemSettings adminId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
