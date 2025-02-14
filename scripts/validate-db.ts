import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const databaseUrlSchema = z
  .string()
  .url()
  .refine((url) => url.startsWith("postgresql://"), {
    message: "DATABASE_URL must be a valid PostgreSQL connection string",
  });

async function validateDatabase() {
  console.log("🔍 Validating database configuration...");

  // 1. Validate DATABASE_URL format
  try {
    databaseUrlSchema.parse(process.env.DATABASE_URL);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid DATABASE_URL format:", error.errors[0].message);
      return false;
    }
  }

  // 2. Test database connection
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to database");

    // 3. Verify required tables exist
    const tables = ["User", "Account", "Session", "VerificationToken"];
    for (const table of tables) {
      try {
        // @ts-ignore - Dynamic table name
        await prisma[table.toLowerCase()].count();
        console.log(`✅ Table ${table} exists and is accessible`);
      } catch (error) {
        console.error(`❌ Table ${table} is missing or inaccessible`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(
      "❌ Database connection failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Create a script to generate a secure NEXTAUTH_SECRET
function generateNextAuthSecret() {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
}

// Validate email configuration
async function validateEmailConfig() {
  const nodemailer = require("nodemailer");

  const requiredVars = [
    "EMAIL_SERVER_HOST",
    "EMAIL_SERVER_PORT",
    "EMAIL_SERVER_USER",
    "EMAIL_SERVER_PASSWORD",
    "EMAIL_FROM",
  ];

  const missingVars = requiredVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    console.warn(
      "⚠️ Missing email configuration variables:",
      missingVars.join(", "),
    );
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number.parseInt(process.env.EMAIL_SERVER_PORT!),
      secure: Number.parseInt(process.env.EMAIL_SERVER_PORT!) === 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.verify();
    console.log("✅ Email configuration is valid");
    return true;
  } catch (error) {
    console.error(
      "❌ Email configuration is invalid:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return false;
  }
}

async function main() {
  console.log("🚀 Starting environment validation\n");

  // Check for .env.local file
  const fs = require("fs");
  if (!fs.existsSync(".env.local")) {
    console.log("⚠️ .env.local file not found, creating from template...");
    const template = `
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${generateNextAuthSecret()}
DATABASE_URL="postgresql://username:password@localhost:5432/smartpro?schema=public"

# Email Configuration
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=noreply@example.com
    `.trim();
    fs.writeFileSync(".env.local", template);
    console.log("✅ Created .env.local template");
  }

  // Validate database
  const dbValid = await validateDatabase();
  if (!dbValid) {
    console.error("\n❌ Database validation failed");
    process.exit(1);
  }

  // Validate email configuration
  const emailValid = await validateEmailConfig();
  if (!emailValid) {
    console.warn(
      "\n⚠️ Email configuration validation failed (not critical but recommended)",
    );
  }

  console.log("\n✅ Environment validation completed successfully!");
}

main().catch(console.error);
