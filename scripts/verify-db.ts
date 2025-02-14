import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Test the connection
    await prisma.$connect()
    console.log("Database connection successful")

    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`Number of users in database: ${userCount}`)
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

