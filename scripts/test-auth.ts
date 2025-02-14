import { prisma } from "../lib/prisma";
import { hash } from "bcrypt";
import chalk from "chalk";

async function testAuthentication() {
  console.log(chalk.blue("\n🔑 Testing Authentication Flow\n"));

  try {
    // Create test user
    const email = `test${Date.now()}@example.com`;
    const password = "TestPassword123!";
    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: `testuser${Date.now()}`,
        role: "CLIENT",
      },
    });

    console.log(chalk.green("✓ Test user created successfully"));

    // Test user retrieval
    const foundUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (foundUser) {
      console.log(chalk.green("✓ User retrieval successful"));
    } else {
      throw new Error("Failed to retrieve test user");
    }

    // Cleanup
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log(chalk.green("✓ Test cleanup successful"));
    console.log(chalk.green("\n✅ Authentication tests passed!"));

    return true;
  } catch (error) {
    console.error(chalk.red("\n❌ Authentication tests failed:"), error);
    return false;
  }
}

testAuthentication().catch(console.error);
