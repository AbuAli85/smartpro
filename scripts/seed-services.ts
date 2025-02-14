import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Create categories first
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Web Development",
          description: "Custom website and web application development services",
          slug: "web-development",
        },
      }),
      prisma.category.create({
        data: {
          name: "Digital Marketing",
          description: "SEO, social media, and digital marketing services",
          slug: "digital-marketing",
        },
      }),
      prisma.category.create({
        data: {
          name: "Graphic Design",
          description: "Professional graphic design and branding services",
          slug: "graphic-design",
        },
      }),
    ])

    // Create a test provider
    const provider = await prisma.user.create({
      data: {
        name: "Test Provider",
        email: "provider@test.com",
        role: "PROVIDER",
      },
    })

    // Create sample services
    const services = await Promise.all(
      categories.flatMap((category) => [
        prisma.service.create({
          data: {
            name: `Professional ${category.name} Service`,
            description: `Expert ${category.name.toLowerCase()} service with fast turnaround and quality results. We specialize in delivering custom solutions tailored to your needs.`,
            price: Math.floor(Math.random() * 900) + 100,
            status: "ACTIVE",
            categoryId: category.id,
            providerId: provider.id,
          },
        }),
        prisma.service.create({
          data: {
            name: `Premium ${category.name} Package`,
            description: `Comprehensive ${category.name.toLowerCase()} package including consultation, implementation, and ongoing support. Perfect for businesses looking for end-to-end solutions.`,
            price: Math.floor(Math.random() * 900) + 100,
            status: "ACTIVE",
            categoryId: category.id,
            providerId: provider.id,
          },
        }),
      ]),
    )

    console.log(`Created ${categories.length} categories`)
    console.log(`Created ${services.length} services`)
  } catch (error) {
    console.error("Seed error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

