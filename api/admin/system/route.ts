import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const activeUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    })

    const totalUsers = await prisma.user.count()

    return NextResponse.json({ activeUsers, totalUsers })
  } catch (error) {
    console.error("Error fetching system data:", error)
    return NextResponse.json({ error: "Failed to fetch system data" }, { status: 500 })
  }
}

