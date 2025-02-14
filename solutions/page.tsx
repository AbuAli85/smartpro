import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SolutionsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Our Solutions</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Analytics</CardTitle>
            <CardDescription>Advanced data analysis using artificial intelligence</CardDescription>
          </CardHeader>
          <CardContent>
            Leverage machine learning algorithms to gain deeper insights into your business data.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Automated Workflow</CardTitle>
            <CardDescription>Streamline your business processes</CardDescription>
          </CardHeader>
          <CardContent>Automate repetitive tasks and improve efficiency across your organization.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Predictive Maintenance</CardTitle>
            <CardDescription>Prevent equipment failures before they happen</CardDescription>
          </CardHeader>
          <CardContent>Use IoT sensors and predictive algorithms to optimize maintenance schedules.</CardContent>
        </Card>
      </div>
    </div>
  )
}

