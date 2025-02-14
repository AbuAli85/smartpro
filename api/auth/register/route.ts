import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { PrismaClient } from "@prisma/client"
import { sendVerificationEmail } from "@/lib/email"

const prisma = new PrismaClient()

async function verifyRecaptcha(token: string) {
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  })

  const data = await response.json()
  return data.success
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role, providerType, companyName, companySize, recaptchaToken } = await req.json()

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!isRecaptchaValid) {
      return NextResponse.json({ error: "Invalid reCAPTCHA. Please try again." }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        providerType: role === "PROVIDER" ? providerType : null,
        companyName: role === "PROVIDER" ? companyName : null,
        companySize: role === "PROVIDER" ? companySize : null,
        emailVerified: null,
      },
    })

    // Send verification email
    await sendVerificationEmail(user.email, user.id)

    return NextResponse.json({ message: "Registration successful" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

