import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ServiceDetails } from "@/components/services/service-details"

interface ServicePageProps {
  params: {
    serviceId: string
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const service = await prisma.service.findUnique({
    where: { id: params.serviceId },
    include: {
      provider: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!service) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ServiceDetails service={service} />
    </div>
  )
}

