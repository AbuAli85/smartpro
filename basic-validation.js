import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

async function testUserCreation() {
  try {
    const hashedPassword = await bcrypt.hash("TestPass123!", 10);
    const user = await prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        password: hashedPassword,
        role: "CLIENT",
      },
    });
    console.log("✅ User creation successful:", user.id);
    return true;
  } catch (error) {
    console.error("❌ User creation failed:", error);
    return false;
  }
}

async function runBasicValidation() {
  console.log("🚀 Starting Basic System Validation\n");

  try {
    // Test database connection
    const dbConnection = await testDatabaseConnection();
    if (!dbConnection) {
      console.log("❌ Validation failed: Database connection error");
      return;
    }

    // Test user creation
    const userCreation = await testUserCreation();
    if (!userCreation) {
      console.log("❌ Validation failed: User creation error");
      return;
    }

    console.log("\n✅ Basic validation completed successfully");
  } catch (error) {
    console.error("❌ Validation failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the validation
runBasicValidation().catch(console.error);
