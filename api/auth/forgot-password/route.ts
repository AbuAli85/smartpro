import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      const token = randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 3600000) // 1 hour from now

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpires: expires,
        },
      })

      // TODO: Send email with reset link
      console.log(`Reset link: http://localhost:3000/auth/reset-password?token=${token}`)
    }

    // Always return a success message to prevent email enumeration
    return NextResponse.json({ message: "If an account with that email exists, we've sent a password reset link." })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}

