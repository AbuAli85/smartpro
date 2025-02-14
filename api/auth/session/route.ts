import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return session data with role information
    return NextResponse.json({
      user: {
        ...session.user,
        role: session.user.role,
        providerType: session.user.providerType,
      },
      expires: session.expires,
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}

