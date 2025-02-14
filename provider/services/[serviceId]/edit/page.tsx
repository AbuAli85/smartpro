import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ServiceEditor } from "@/components/services/service-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EditServicePageProps {
  params: {
    serviceId: string
  }
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const session = await auth()

  if (!session?.user || session.user.role !== "PROVIDER") {
    redirect("/unauthorized")
  }

  const [service, categories] = await Promise.all([
    prisma.service.findUnique({
      where: { id: params.serviceId },
    }),
    prisma.category.findMany(),
  ])

  if (!service || service.providerId !== session.user.id) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Service</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceEditor categories={categories} service={service} />
        </CardContent>
      </Card>
    </div>
  )
}

