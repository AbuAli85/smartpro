import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>You don&apos;t have permission to access this page. This could be because:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
            <li>You&apos;re trying to access a page that requires different user permissions</li>
            <li>Your session might have expired</li>
            <li>You haven&apos;t completed the required verification steps</li>
          </ul>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/support">Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

