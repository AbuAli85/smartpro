import { PrismaClient } from "@prisma/client"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function applyMigrations() {
  try {
    console.log("Applying migrations...")

    // Run Prisma migrations
    await execAsync("npx prisma migrate deploy")

    // Verify database connection and schema
    await prisma.$connect()

    // Test LoginAttempt table
    const testAttempt = await prisma.loginAttempt.create({
      data: {
        userId: (await prisma.user.findFirst())?.id ?? "",
        success: true,
      },
    })

    console.log("Test login attempt created:", testAttempt)

    // Clean up test data
    await prisma.loginAttempt.delete({
      where: { id: testAttempt.id },
    })

    console.log("Migrations applied successfully!")
  } catch (error) {
    console.error("Migration error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

applyMigrations()

