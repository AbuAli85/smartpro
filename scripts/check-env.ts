import { validateEnvironment } from "../utils/env-validator";
import { testDatabaseConnection } from "../utils/db-tester";

async function checkEnvironment() {
  console.log("🔍 Checking environment configuration...");

  // Validate environment
  const validation = await validateEnvironment();

  console.log("\n=== Environment Validation Report ===\n");

  if (validation.isValid) {
    console.log(
      "✅ All required environment variables are properly configured",
    );
  } else {
    console.log("❌ Some issues were found with the environment configuration");
  }

  if (validation.issues.length > 0) {
    console.log("\n🚨 Critical Issues:");
    validation.issues.forEach((issue) => console.log(`- ${issue}`));
  }

  if (validation.warnings.length > 0) {
    console.log("\n⚠️ Warnings:");
    validation.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  // Test database connection
  console.log("\n🔌 Testing database connection...");
  const dbTest = await testDatabaseConnection();
  console.log(dbTest.success ? "✅" : "❌", dbTest.message);

  // Provide next steps
  if (!validation.isValid || !dbTest.success) {
    console.log("\n📋 Next Steps:");
    console.log("1. Fix any critical issues reported above");
    console.log(
      "2. Run 'npm run generate-secrets' if NEXTAUTH_SECRET is missing",
    );
    console.log("3. Verify database credentials if connection failed");
    console.log("4. Update email configuration if needed");
    process.exit(1);
  }

  console.log("\n✨ Environment is properly configured!");
}

checkEnvironment().catch(console.error);
