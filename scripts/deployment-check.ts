import { PrismaClient } from "@prisma/client"
import { stripe } from "@/lib/stripe"

async function checkDeploymentReadiness() {
  console.log("🔍 Checking deployment readiness...")

  // Check database connection
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()
    console.log("✅ Database connection successful")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
  }

  // Check Stripe configuration
  try {
    await stripe.paymentMethods.list({ limit: 1 })
    console.log("✅ Stripe configuration verified")
  } catch (error) {
    console.error("❌ Stripe configuration invalid:", error)
    process.exit(1)
  }

  // Check required environment variables
  const requiredEnvVars = [
    "DATABASE_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ]

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missingEnvVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingEnvVars)
    process.exit(1)
  }

  console.log("✅ All environment variables present")
  console.log("✅ Deployment checks passed")
}

checkDeploymentReadiness()

// Completion note: Deployment readiness check script implemented ✓

