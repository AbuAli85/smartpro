import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
})

async function main() {
  try {
    console.log("Attempting to connect to the database...")
    const result = await prisma.$queryRaw`SELECT current_database() as database, current_user as user`
    console.log("Connection successful. Database details:", result)

    console.log("Attempting to query the User table...")
    const userCount = await prisma.user.count()
    console.log(`Number of users in the database: ${userCount}`)
  } catch (error) {
    console.error("Error details:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

