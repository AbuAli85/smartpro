import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Create UserStatus enum
    console.log("Creating UserStatus enum...")
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // Add status column to User table
    console.log("Adding status column to User table...")
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE'
    `

    // Update existing users
    console.log("Updating existing users to have the ACTIVE status...")
    await prisma.$executeRaw`
      UPDATE "User" SET "status" = 'ACTIVE' WHERE "status" IS NULL
    `

    console.log("Migration applied successfully")
  } catch (error) {
    console.error("Error applying migration:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

