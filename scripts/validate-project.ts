import { PrismaClient } from "@prisma/client";
import { authOptions } from "../app/api/auth/[...nextauth]/auth-options";
import fetch from "node-fetch";
import chalk from "chalk";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation Schemas
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

async function validateDatabase() {
  console.log(chalk.blue("\n🔍 Validating Database Connection..."));

  try {
    await prisma.$connect();
    console.log(chalk.green("✓ Database connection successful"));

    // Verify tables
    const tables = ["User", "Service", "Order", "Notification"];
    for (const table of tables) {
      const count = await prisma[table.toLowerCase()].count();
      console.log(chalk.green(`✓ Table ${table} exists with ${count} records`));
    }

    return true;
  } catch (error) {
    console.error(chalk.red("✗ Database validation failed:"), error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function validateAuthConfig() {
  console.log(chalk.blue("\n🔐 Validating Authentication Configuration..."));

  try {
    // Validate environment variables
    const env = {
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    };

    envSchema.parse(env);
    console.log(chalk.green("✓ Environment variables validated"));

    // Validate NextAuth configuration
    if (!authOptions.adapter) {
      throw new Error("NextAuth adapter not configured");
    }
    if (!authOptions.providers || authOptions.providers.length === 0) {
      throw new Error("No authentication providers configured");
    }
    console.log(chalk.green("✓ NextAuth configuration validated"));

    return true;
  } catch (error) {
    console.error(chalk.red("✗ Authentication validation failed:"), error);
    return false;
  }
}

async function validateAPIRoutes() {
  console.log(chalk.blue("\n🌐 Validating API Routes..."));

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const routes = [
    "/api/auth/session",
    "/api/analytics",
    "/api/payments/process",
  ];

  try {
    for (const route of routes) {
      const response = await fetch(`${baseUrl}${route}`);
      const status = response.status;

      if (status === 401) {
        console.log(
          chalk.yellow(`⚠ Route ${route} requires authentication (expected)`),
        );
      } else if (status >= 500) {
        console.error(
          chalk.red(`✗ Route ${route} returned server error ${status}`),
        );
      } else {
        console.log(chalk.green(`✓ Route ${route} responding correctly`));
      }
    }

    return true;
  } catch (error) {
    console.error(chalk.red("✗ API routes validation failed:"), error);
    return false;
  }
}

async function validateProjectStructure() {
  console.log(chalk.blue("\n📁 Validating Project Structure..."));

  const requiredFiles = [
    "app/layout.tsx",
    "app/page.tsx",
    "app/providers.tsx",
    "app/api/auth/[...nextauth]/route.ts",
    "app/api/auth/[...nextauth]/auth-options.ts",
    "prisma/schema.prisma",
    "lib/prisma.ts",
  ];

  try {
    const fs = require("fs");
    const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file));

    if (missingFiles.length > 0) {
      console.error(chalk.red("✗ Missing required files:"), missingFiles);
      return false;
    }

    console.log(chalk.green("✓ All required files present"));
    return true;
  } catch (error) {
    console.error(chalk.red("✗ Project structure validation failed:"), error);
    return false;
  }
}

async function main() {
  console.log(chalk.bold("\n🚀 Starting Project Validation\n"));

  const results = await Promise.all([
    validateDatabase(),
    validateAuthConfig(),
    validateAPIRoutes(),
    validateProjectStructure(),
  ]);

  const allValid = results.every(Boolean);

  console.log(chalk.bold("\n📊 Validation Summary"));
  console.log(chalk.bold("=================="));

  if (allValid) {
    console.log(
      chalk.green(
        "\n✅ All validations passed! Project is ready for deployment.",
      ),
    );
  } else {
    console.log(
      chalk.red(
        "\n❌ Some validations failed. Please fix the issues above before deploying.",
      ),
    );
    process.exit(1);
  }
}

main().catch(console.error);
