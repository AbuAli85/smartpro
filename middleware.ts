import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "./types/auth"
import { createClient } from "@supabase/supabase-js"

// Define route access patterns
const ROUTE_ACCESS = {
  "/admin": [UserRole.ADMIN],
  "/company": [UserRole.ADMIN, UserRole.COMPANY],
  "/promoter": [UserRole.ADMIN, UserRole.PROMOTER],
  "/edge-functions": [UserRole.ADMIN],
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/", "/api/auth"]

export async function middleware(request: NextRequest) {
  // Skip middleware for public routes and static files
  const { pathname } = request.nextUrl
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.includes("_next") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next()
  }

  // Create a Supabase client for server-side auth checks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })

  // Get the auth cookie
  const supabaseAuthCookie = request.cookies.get("sb-auth-token")?.value

  // If no auth cookie, redirect to login
  if (!supabaseAuthCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // Verify the session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(supabaseAuthCookie)

    if (error || !user) {
      // Invalid or expired session, redirect to login
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Get user role from database
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError) {
      console.error("Error fetching user role:", userError)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const userRole = userData?.role || user.user_metadata?.role || UserRole.USER

    // Check if the current path has role restrictions
    for (const [path, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
      if (pathname.startsWith(path)) {
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

    // Add user role to request headers for server components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-role", userRole)

    // Continue with the request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
