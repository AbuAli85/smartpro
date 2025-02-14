import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { name, email, username, password, role } = await req.json()
    console.log("Test registration request:", { name, email, username, role })

    // Test database connection
    await prisma.$connect()
    console.log("Database connection successful")

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      console.log("Existing user found:", existingUser.email)
      return NextResponse.json({
        success: false,
        message: "User already exists",
      })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)
    console.log("Password hashed successfully")

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        role,
      },
    })

    console.log("User created successfully:", { id: user.id, email: user.email })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

