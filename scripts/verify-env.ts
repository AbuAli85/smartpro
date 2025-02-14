import { Redis } from "@upstash/redis";

async function verifyEnvironmentVariables() {
  try {
    // Test NextAuth Secret
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error("NEXTAUTH_SECRET is not set");
    }

    // Test Redis connection
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    await redis.ping();
    console.log("✅ Redis connection successful");

    console.log("✅ All available environment variables verified successfully");
  } catch (error) {
    console.error("❌ Error verifying environment variables:", error);
    process.exit(1);
  }
}

verifyEnvironmentVariables();
