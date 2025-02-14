import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function testConnection() {
  try {
    await prisma.$connect()
    console.log("Successfully connected to the database")
    const userCount = await prisma.user.count()
    console.log(`Number of users in the database: ${userCount}`)
  } catch (error) {
    console.error("Failed to connect to the database:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

