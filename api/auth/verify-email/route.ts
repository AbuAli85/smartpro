import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Invalid verification link" }, { status: 400 })
  }

  try {
    const user = await prisma.user.update({
      where: { id: token },
      data: { emailVerified: new Date() },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid verification link" }, { status: 400 })
    }

    // Redirect to appropriate dashboard based on role
    let redirectUrl = "/dashboard"
    switch (user.role) {
      case "ADMIN":
        redirectUrl = "/dashboard/admin"
        break
      case "PROVIDER":
        redirectUrl = "/dashboard/provider"
        break
      case "CLIENT":
        redirectUrl = "/dashboard/client"
        break
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${redirectUrl}`)
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Email verification failed" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

