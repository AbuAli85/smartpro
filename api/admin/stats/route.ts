import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch stats from the database
    const userCount = await prisma.user.count()
    const serviceCount = await prisma.service.count()
    const orderCount = await prisma.order.count()

    // Calculate total revenue
    const orders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
    })
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

    return NextResponse.json({
      userCount,
      serviceCount,
      orderCount,
      totalRevenue,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

