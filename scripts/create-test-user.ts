import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "test@example.com"
  const password = "password123"

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: "Test User",
    },
  })

  console.log(`Test user created: ${user.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

