import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { OrderForm } from "@/components/orders/order-form"

interface OrderPageProps {
  params: {
    serviceId: string
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const service = await prisma.service.findUnique({
    where: { id: params.serviceId },
  })

  if (!service) {
    redirect("/services")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Place Order</h1>
      <OrderForm serviceId={service.id} serviceName={service.name} />
    </div>
  )
}

