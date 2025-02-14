import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProviderOrderList } from "@/components/provider/provider-order-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProviderOrdersPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "PROVIDER") {
    redirect("/unauthorized")
  }

  const orders = await prisma.order.findMany({
    where: {
      providerId: session.user.id,
    },
    include: {
      service: true,
      user: true,
      statusHistory: {
        include: {
          updatedBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ProviderOrderList orders={orders} />
        </CardContent>
      </Card>
    </div>
  )
}

