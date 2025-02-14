import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { OrderDetails } from "@/components/orders/order-details"

interface OrderPageProps {
  params: {
    orderId: string
  }
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const order = await prisma.order.findUnique({
    where: {
      id: params.orderId,
    },
  })

  if (!order) {
    return {
      title: "Order Not Found",
    }
  }

  return {
    title: `Order ${order.id}`,
    description: `Order details for ${order.id}`,
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const order = await prisma.order.findUnique({
    where: {
      id: params.orderId,
    },
    include: {
      service: true,
      provider: true,
      user: true,
    },
  })

  if (!order) {
    notFound()
  }

  return <OrderDetails order={order} />
}

