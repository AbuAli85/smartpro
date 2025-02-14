import fetch from "node-fetch";

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

interface ValidationResult {
  status: boolean;
  message: string;
}

async function runBasicValidation() {
  console.log(`🔍 Starting Basic System Validation on ${BASE_URL}...\n`);

  const results = {
    auth: await validateAuth(),
    api: await validateAPI(),
    database: await validateDatabase(),
  };

  console.log("\n📋 System Validation Report");
  console.log("===========================");

  let issuesFound = 0;
  for (const [category, result] of Object.entries(results)) {
    console.log(`\n${category.toUpperCase()}:`);
    console.log("Status:", result.status ? "✅ PASS" : "❌ FAIL");
    if (result.message) {
      console.log("Message:", result.message);
    }
    if (!result.status) issuesFound++;
  }

  console.log("\n📊 Summary:");
  console.log(`Issues Found: ${issuesFound}`);
  console.log(
    `System Status: ${issuesFound === 0 ? "✅ Ready" : "⚠️ Needs Attention"}`,
  );
}

async function validateAuth(): Promise<ValidationResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/test-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "testpassword",
      }),
    });

    const data = (await response.json()) as { error?: string };
    console.log("Auth response:", data);

    return {
      status: response.ok,
      message: response.ok
        ? "Authentication endpoints responding"
        : `Authentication check failed: ${data.error || "Unknown error"}`,
    };
  } catch (error) {
    console.error("Auth error details:", error);
    return {
      status: false,
      message: `Auth Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function validateAPI(): Promise<ValidationResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/test-auth`);
    const data = (await response.json()) as { error?: string };
    console.log("API response:", data);

    return {
      status: response.ok,
      message: response.ok
        ? "API endpoints responding"
        : `API check failed: ${data.error || "Unknown error"}`,
    };
  } catch (error) {
    console.error("API error details:", error);
    return {
      status: false,
      message: `API Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function validateDatabase(): Promise<ValidationResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/test-db`);
    const data = (await response.json()) as {
      message?: string;
      error?: string;
    };
    console.log("Database response:", data);

    return {
      status: response.ok && data.message === "Database connection successful",
      message: response.ok
        ? "Database connection verified"
        : `Database check failed: ${data.error || "Unknown error"}`,
    };
  } catch (error) {
    console.error("Database error details:", error);
    return {
      status: false,
      message: `Database Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

runBasicValidation().catch(console.error);
