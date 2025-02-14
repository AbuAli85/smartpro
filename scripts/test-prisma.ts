import { PrismaClient } from "@prisma/client"

async function testPrisma() {
  const prisma = new PrismaClient()

  try {
    const result = await prisma.service.findMany()
    console.log("Prisma query successful:", result)
  } catch (error) {
    console.error("Prisma query failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testPrisma()

