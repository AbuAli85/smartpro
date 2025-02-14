import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

// Define public routes that don't require authentication
const publicRoutes = ["/", "/signin", "/register", "/auth/verify-email"]

// Define role-specific routes
const roleRoutes = {
  [UserRole.ADMIN]: ["/dashboard/admin"],
  [UserRole.PROVIDER]: ["/dashboard/provider"],
  [UserRole.CLIENT]: ["/dashboard/client"],
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Allow public assets and API routes
    if (path.startsWith("/_next") || path.startsWith("/api/") || path.includes(".") || path === "/favicon.ico") {
      return NextResponse.next()
    }

    // Allow public routes
    if (publicRoutes.includes(path)) {
      // Redirect authenticated users away from auth pages
      if (token && (path === "/signin" || path === "/register")) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return NextResponse.next()
    }

    // Handle unauthenticated users
    if (!token) {
      const from = encodeURIComponent(path)
      return NextResponse.redirect(new URL(`/signin?from=${from}`, req.url))
    }

    // Allow access to role selection for users without a role
    if (!token.role && path === "/role-selection") {
      return NextResponse.next()
    }

    // Redirect users without a role to role selection
    if (!token.role) {
      return NextResponse.redirect(new URL("/role-selection", req.url))
    }

    // Handle dashboard routes
    if (path === "/dashboard") {
      const dashboardMap = {
        [UserRole.ADMIN]: "/dashboard/admin",
        [UserRole.PROVIDER]: "/dashboard/provider",
        [UserRole.CLIENT]: "/dashboard/client",
      }
      return NextResponse.redirect(new URL(dashboardMap[token.role as UserRole], req.url))
    }

    // Check role-specific route access
    const userRole = token.role as UserRole
    const allowedRoutes = roleRoutes[userRole] || []
    const isAllowedRoute = allowedRoutes.some((route) => path.startsWith(route))

    if (!isAllowedRoute) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

