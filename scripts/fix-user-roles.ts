import { PrismaClient, UserRole } from "@prisma/client"
import { logger } from "@/lib/logger"

const prisma = new PrismaClient()

async function fixUserRoles() {
  try {
    // Find users with invalid roles
    const users = await prisma.user.findMany({
      where: {
        OR: [{ role: null }, { role: { not: { in: Object.values(UserRole) } } }],
      },
      select: { id: true, email: true, role: true },
    })

    logger.info(`Found ${users.length} users with invalid roles`)

    // Update users with invalid roles
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.CLIENT },
      })
      logger.info(`Updated user role`, { userId: user.id, oldRole: user.role, newRole: UserRole.CLIENT })
    }

    logger.info("Role fix completed successfully")
  } catch (error) {
    logger.error("Role fix failed", { error })
  } finally {
    await prisma.$disconnect()
  }
}

fixUserRoles()

