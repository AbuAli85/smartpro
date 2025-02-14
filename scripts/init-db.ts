import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Create test provider
    const provider = await prisma.user.create({
      data: {
        name: "Test Provider",
        email: "provider@test.com",
        role: "PROVIDER",
      },
    })

    // Create categories
    const webDev = await prisma.category.create({
      data: {
        name: "Web Development",
        description: "Custom website and web application development services",
        slug: "web-development",
      },
    })

    // Create sample service
    await prisma.service.create({
      data: {
        name: "Professional Website Development",
        description: "Custom website development with modern technologies and responsive design.",
        price: 999.99,
        status: "ACTIVE",
        categoryId: webDev.id,
        providerId: provider.id,
      },
    })

    console.log("Database initialized successfully!")
  } catch (error) {
    console.error("Initialization error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

