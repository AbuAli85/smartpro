import { PrismaClient } from "@prisma/client"

async function main() {
  console.log("Starting Prisma verification...")
  const prisma = new PrismaClient()

  try {
    console.log("Attempting to connect to the database...")
    const result = await prisma.$queryRaw`SELECT 1+1 AS result`
    console.log("Database connection successful:", result)

    console.log("Checking for existing tables...")
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log("Existing tables:", tables)

    console.log("Attempting to query the Service model...")
    const services = await prisma.service.findMany({ take: 1 })
    console.log("Service query result:", services)
  } catch (error) {
    console.error("Error during Prisma verification:", error)
  } finally {
    await prisma.$disconnect()
    console.log("Prisma client disconnected.")
  }
}

main()
  .catch((e) => {
    console.error("Unhandled error in main function:", e)
    process.exit(1)
  })
  .finally(() => {
    console.log("Verification script completed.")
  })

