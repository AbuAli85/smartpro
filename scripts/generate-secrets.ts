import crypto from "crypto";
import fs from "fs";
import path from "path";

function generateSecureSecret() {
  return crypto.randomBytes(32).toString("hex");
}

function updateEnvFile(envPath: string, updates: Record<string, string>) {
  let content = "";

  // Read existing content if file exists
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf-8");
  }

  // Update or add each variable
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*`, "m");
    const newLine = `${key}=${value}`;

    if (regex.test(content)) {
      content = content.replace(regex, newLine);
    } else {
      content += `\n${newLine}`;
    }
  }

  fs.writeFileSync(envPath, content.trim() + "\n");
}

async function main() {
  const envPath = path.join(process.cwd(), ".env.local");

  const updates: Record<string, string> = {
    NEXTAUTH_SECRET: generateSecureSecret(),
  };

  updateEnvFile(envPath, updates);

  console.log("Generated and updated secrets in .env.local");
  console.log("New values:");
  console.log(updates);
}

main().catch(console.error);
