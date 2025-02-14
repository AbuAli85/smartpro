import { NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/mail"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Use a dummy token for testing
    const dummyToken = "test-verification-token"

    await sendVerificationEmail(email, dummyToken)

    return NextResponse.json({ message: "Test email sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Failed to send test email:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}

