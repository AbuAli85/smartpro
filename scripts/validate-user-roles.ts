import { PrismaClient, UserRole } from "@prisma/client"
import { logger } from "@/lib/logger"

const prisma = new PrismaClient()

async function validateAndFixUserRoles() {
  try {
    // Find users without roles
    const usersWithoutRoles = await prisma.user.findMany({
      where: {
        OR: [{ role: null }, { role: { not: { in: Object.values(UserRole) } } }],
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    if (usersWithoutRoles.length > 0) {
      logger.warn(`Found ${usersWithoutRoles.length} users without valid roles`)

      // Set default role to CLIENT for users without roles
      await Promise.all(
        usersWithoutRoles.map((user) =>
          prisma.user.update({
            where: { id: user.id },
            data: { role: "CLIENT" },
          }),
        ),
      )

      logger.info("Fixed user roles", {
        fixed: usersWithoutRoles.length,
        defaultRole: "CLIENT",
      })
    }

    // Verify all users now have valid roles
    const invalidUsers = await prisma.user.findMany({
      where: {
        OR: [{ role: null }, { role: { not: { in: Object.values(UserRole) } } }],
      },
    })

    if (invalidUsers.length > 0) {
      throw new Error(`Still found ${invalidUsers.length} users with invalid roles`)
    }

    logger.info("All users have valid roles")
    return true
  } catch (error) {
    logger.error("Role validation failed", { error })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute if running directly
if (require.main === module) {
  validateAndFixUserRoles()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { validateAndFixUserRoles }

