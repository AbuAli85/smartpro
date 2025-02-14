import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    console.log("Verifying email with token:", token)

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    })

    if (!user) {
      console.log("Invalid verification token")
      return NextResponse.json({ message: "Invalid verification token" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        status: "ACTIVE",
      },
    })

    console.log("Email verified successfully for user:", user.email)
    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

