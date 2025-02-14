import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ServiceEditor } from "@/components/services/service-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewServicePage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "PROVIDER") {
    redirect("/unauthorized")
  }

  const categories = await prisma.category.findMany()

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Service</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceEditor categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}

