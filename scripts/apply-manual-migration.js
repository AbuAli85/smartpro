const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

async function applyManualMigration() {
  try {
    console.log("Applying manual migration...")

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "../prisma/migrations/manual/20250209_add_login_attempt.sql"),
      "utf8",
    )

    // Split the SQL into individual statements
    const statements = migrationSQL.split(";").filter((statement) => statement.trim() !== "")

    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement + ";")
    }

    console.log("Manual migration applied successfully!")

    // Verify the changes
    const loginAttemptTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'LoginAttempt'
      );
    `
    console.log("LoginAttempt table exists:", loginAttemptTableExists)

    // Test creating a login attempt
    const testUser = await prisma.user.findFirst()
    if (testUser) {
      const testAttempt = await prisma.loginAttempt.create({
        data: {
          userId: testUser.id,
          success: true,
        },
      })
      console.log("Test login attempt created:", testAttempt)

      // Clean up test data
      await prisma.loginAttempt.delete({
        where: { id: testAttempt.id },
      })
    } else {
      console.log("No users found to test LoginAttempt creation")
    }
  } catch (error) {
    console.error("Migration error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

applyManualMigration()

