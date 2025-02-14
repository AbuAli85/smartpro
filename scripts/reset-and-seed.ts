import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database reset and seed process...")

  try {
    // Clear existing data
    console.log("Clearing existing data...")
    await prisma.review.deleteMany()
    await prisma.order.deleteMany()
    await prisma.service.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()

    // Create test users
    console.log("Creating test users...")
    const testUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: "user@test.com",
        role: "USER",
      },
    })

    const testProvider = await prisma.user.create({
      data: {
        name: "Test Provider",
        email: "provider@test.com",
        role: "PROVIDER",
      },
    })

    // Create categories
    console.log("Creating categories...")
    const webDev = await prisma.category.create({
      data: {
        name: "Web Development",
        description: "Custom website and web application development services",
        slug: "web-development",
      },
    })

    const digitalMarketing = await prisma.category.create({
      data: {
        name: "Digital Marketing",
        description: "SEO, social media, and digital marketing services",
        slug: "digital-marketing",
      },
    })

    // Create sample services
    console.log("Creating sample services...")
    const webDevService = await prisma.service.create({
      data: {
        name: "Professional Website Development",
        description: "Custom website development with modern technologies and responsive design.",
        price: 999.99,
        status: "ACTIVE",
        categoryId: webDev.id,
        providerId: testProvider.id,
      },
    })

    const marketingService = await prisma.service.create({
      data: {
        name: "SEO Optimization Package",
        description: "Comprehensive SEO optimization to improve your website's search engine rankings.",
        price: 499.99,
        status: "ACTIVE",
        categoryId: digitalMarketing.id,
        providerId: testProvider.id,
      },
    })

    // Create sample order
    console.log("Creating sample order...")
    await prisma.order.create({
      data: {
        userId: testUser.id,
        serviceId: webDevService.id,
        status: "COMPLETED",
        amount: webDevService.price,
      },
    })

    console.log("Database reset and seed completed successfully!")
  } catch (error) {
    console.error("Error during database reset and seed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error("Unhandled error in main function:", e)
    process.exit(1)
  })
  .finally(() => {
    console.log("Reset and seed script completed.")
  })

