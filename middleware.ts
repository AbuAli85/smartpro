import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "./types/auth"

// Define route access patterns
const ROUTE_ACCESS = {
  "/admin": [UserRole.ADMIN],
  "/company": [UserRole.ADMIN, UserRole.COMPANY],
  "/promoter": [UserRole.ADMIN, UserRole.PROMOTER],
  "/edge-functions": [UserRole.ADMIN],
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/"]

export function middleware(request: NextRequest) {
  // Get auth token from cookies
  const authToken = request.cookies.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "lovable_access_token")?.value

  // Get user role from a secure HTTP-only cookie
  const userRole = request.cookies.get("user_role")?.value

  // Check if the path requires authentication
  const isPublicRoute = PUBLIC_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route))

  // If no auth token and not a public route, redirect to login
  if (!authToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If authenticated, check role-based access
  if (authToken && userRole) {
    // Check if the current path has role restrictions
    for (const [path, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
      if (request.nextUrl.pathname.startsWith(path)) {
        // If user's role is not in the allowed roles, redirect to appropriate page
        if (!allowedRoles.includes(userRole as UserRole)) {
          // Redirect based on role
          if (userRole === UserRole.ADMIN) {
            return NextResponse.redirect(new URL("/admin", request.url))
          } else if (userRole === UserRole.COMPANY) {
            return NextResponse.redirect(new URL("/company", request.url))
          } else if (userRole === UserRole.PROMOTER) {
            return NextResponse.redirect(new URL("/promoter", request.url))
          } else {
            return NextResponse.redirect(new URL("/", request.url))
          }
        }
      }
    }
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/admin/:path*", "/company/:path*", "/promoter/:path*", "/contracts/:path*", "/edge-functions/:path*"],
}
