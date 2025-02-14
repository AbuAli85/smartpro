import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const log = await prisma.systemLog.create({
      data: {
        level: body.level,
        message: body.message,
        timestamp: new Date(body.timestamp),
        data: body.data,
        userId: session?.user?.id,
      },
    })

    return NextResponse.json({ success: true, log })
  } catch (error) {
    console.error("Failed to write log:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

