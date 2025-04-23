import { z } from "zod"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { UserRole } from "@/types/auth"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Validates JWT token and returns user data
 */
export async function validateAuth(request: Request) {
  // Get the Authorization header
  const authHeader = request.headers.get("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: "Unauthorized: Missing or invalid Authorization header",
      status: 401,
      user: null,
    }
  }

  // Extract the token
  const token = authHeader.split(" ")[1]

  try {
    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return {
        error: "Unauthorized: Invalid token",
        status: 401,
        user: null,
      }
    }

    // Get user role from metadata or a separate query
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError) {
      console.error("Error fetching user role:", userError)
    }

    // Return the user with role
    return {
      error: null,
      status: 200,
      user: {
        ...user,
        role: userData?.role || "user",
      },
    }
  } catch (error) {
    console.error("Error validating auth:", error)
    return {
      error: "Unauthorized: Token validation failed",
      status: 401,
      user: null,
    }
  }
}

/**
 * Checks if user has required role
 */
export function hasRequiredRole(userRole: string | undefined, requiredRoles: UserRole | UserRole[]) {
  if (!userRole) return false

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(userRole as UserRole)
}

/**
 * Validates request data against a Zod schema
 */
export function validateRequest<T>(data: unknown, schema: z.ZodType<T>): { data: T | null; error: string | null } {
  try {
    const validatedData = schema.parse(data)
    return { data: validatedData, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      }
    }
    return { data: null, error: "Invalid data format" }
  }
}

/**
 * Helper to create a standardized error response
 */
export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * Helper to create a standardized success response
 */
export function createSuccessResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * CORS headers for Edge Functions
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, replace with your domain
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: Response): Response {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
