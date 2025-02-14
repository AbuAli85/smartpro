import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ valid: false, error: "No session" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, emailVerified: true },
    })

    if (!user) {
      return NextResponse.json({ valid: false, error: "User not found" }, { status: 404 })
    }

    if (!user.role) {
      return NextResponse.json({ valid: false, error: "No role assigned" }, { status: 403 })
    }

    return NextResponse.json({
      valid: true,
      user: {
        role: user.role,
        emailVerified: user.emailVerified,
      },
    })
  } catch (error) {
    console.error("Session validation error:", error)
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 })
  }
}

