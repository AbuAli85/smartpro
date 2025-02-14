import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    logger.warn("Unauthorized dashboard access attempt")
    redirect("/signin")
  }

  if (!session.user.role) {
    logger.warn("User missing role", { userId: session.user.id })
    redirect("/role-selection")
  }

  // Log successful access
  logger.info("Dashboard access", {
    userId: session.user.id,
    role: session.user.role,
  })

  // Redirect to role-specific dashboard
  switch (session.user.role) {
    case "ADMIN":
      redirect("/dashboard/admin")
    case "PROVIDER":
      redirect("/dashboard/provider")
    case "CLIENT":
      redirect("/dashboard/client")
    default:
      logger.error("Invalid role detected", {
        userId: session.user.id,
        role: session.user.role,
      })
      redirect("/unauthorized")
  }
}

