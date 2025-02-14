import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, providerType: true },
    })

    if (!user) {
      logger.error("User not found in database", { userId: session.user.id })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.role) {
      logger.warn("User has no role assigned", { userId: session.user.id })
      return NextResponse.json({ error: "No role assigned" }, { status: 403 })
    }

    return NextResponse.json({
      role: user.role,
      providerType: user.providerType,
    })
  } catch (error) {
    logger.error("Role validation error", { error })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

