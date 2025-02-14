import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    redirect("/auth/login")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Platform Settings</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Configure system-wide email notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="user-notifications">User Registration Notifications</Label>
              <Switch id="user-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="order-notifications">New Order Notifications</Label>
              <Switch id="order-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure platform security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
              <Switch id="two-factor" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-approve">Auto-approve New Users</Label>
              <Switch id="auto-approve" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

