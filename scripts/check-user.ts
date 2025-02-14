import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
})

async function checkUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log(`User not found: ${email}`)
      return
    }

    console.log(`User found: ${email}`)
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (isPasswordValid) {
      console.log("Password is valid")
    } else {
      console.log("Password is invalid")
    }
  } catch (error) {
    console.error("Error checking user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Replace with actual email and password to test
checkUser("test@example.com", "testpassword")

