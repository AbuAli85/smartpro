import { PrismaClient } from "@prisma/client";
import { authOptions } from "../app/api/auth/[...nextauth]/auth-options";

async function verifySetup() {
  console.log("Verifying project setup...");

  // Check environment variables
  const requiredEnvVars = [
    "DATABASE_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "EMAIL_SERVER_HOST",
    "EMAIL_SERVER_PORT",
    "EMAIL_SERVER_USER",
    "EMAIL_SERVER_PASSWORD",
    "EMAIL_FROM",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingEnvVars.length > 0) {
    console.error("Missing required environment variables:", missingEnvVars);
    process.exit(1);
  }

  // Test database connection
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("Database connection successful");
    await prisma.$disconnect();
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }

  // Verify NextAuth configuration
  if (!authOptions.adapter) {
    console.error("NextAuth adapter not configured");
    process.exit(1);
  }

  console.log("Setup verification completed successfully!");
}

verifySetup().catch(console.error);
