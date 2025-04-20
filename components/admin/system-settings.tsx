"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SystemSettings({ adminId }: { adminId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // These would typically be loaded from your database
  const [settings, setSettings] = useState({
    enableEmailNotifications: true,
    enableAutoApprovals: false,
    requireTwoFactorAuth: false,
    maxTemplatesPerUser: 50,
    maxContractsPerUser: 100,
    defaultLanguage: "en",
  })

  const handleSaveSettings = async () => {
    setIsLoading(true)

    try {
      // In a real application, you would save these settings to your database
      // For now, we'll just simulate a delay and show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <span>System Settings</span>
        </CardTitle>
        <CardDescription>Configure global system settings and defaults</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">General Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <select
                    id="defaultLanguage"
                    className="w-full p-2 border rounded-md"
                    value={settings.defaultLanguage}
                    onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTemplatesPerUser">Max Templates Per User</Label>
                  <Input
                    id="maxTemplatesPerUser"
                    type="number"
                    value={settings.maxTemplatesPerUser}
                    onChange={(e) => setSettings({ ...settings, maxTemplatesPerUser: Number.parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxContractsPerUser">Max Contracts Per User</Label>
                  <Input
                    id="maxContractsPerUser"
                    type="number"
                    value={settings.maxContractsPerUser}
                    onChange={(e) => setSettings({ ...settings, maxContractsPerUser: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Security Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requireTwoFactorAuth">Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require all users to set up 2FA for their accounts</p>
                  </div>
                  <Switch
                    id="requireTwoFactorAuth"
                    checked={settings.requireTwoFactorAuth}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireTwoFactorAuth: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableAutoApprovals">Enable Auto-Approvals</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve templates from trusted users</p>
                  </div>
                  <Switch
                    id="enableAutoApprovals"
                    checked={settings.enableAutoApprovals}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableAutoApprovals: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for important system events
                    </p>
                  </div>
                  <Switch
                    id="enableEmailNotifications"
                    checked={settings.enableEmailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableEmailNotifications: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
