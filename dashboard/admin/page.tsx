import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboard() {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    redirect("/auth/login")
  }

  // Fetch dashboard statistics
  const [userCount, orderCount, providerCount, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "provider" } }),
    prisma.order.aggregate({
      _sum: {
        amount: true,
      },
    }),
  ])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Service Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{providerCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue._sum.amount || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

