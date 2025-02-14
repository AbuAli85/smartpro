import { exec } from "child_process"
import { promisify } from "util"
import { prisma } from "@/lib/prisma"

const execAsync = promisify(exec)

async function deploy() {
  console.log("🚀 Starting deployment process...")

  // Step 1: Environment Variables Check
  console.log("📋 Checking environment variables...")
  const requiredEnvVars = [
    "DATABASE_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }

  // Step 2: Database Migration
  console.log("🔄 Running database migrations...")
  try {
    await execAsync("npx prisma migrate deploy")
    console.log("✅ Database migrations completed")
  } catch (error) {
    console.error("❌ Database migration failed:", error)
    process.exit(1)
  }

  // Step 3: Build Process
  console.log("🏗️ Building application...")
  try {
    await execAsync("npm run build")
    console.log("✅ Build completed")
  } catch (error) {
    console.error("❌ Build failed:", error)
    process.exit(1)
  }

  // Step 4: Cache Warmup
  console.log("🔥 Warming up cache...")
  try {
    await prisma.service.findMany({ take: 10 })
    console.log("✅ Cache warmed up")
  } catch (error) {
    console.error("⚠️ Cache warmup failed:", error)
  }

  console.log("✅ Deployment process completed successfully")
}

deploy()

// Completion note: Deployment script implemented ✓

