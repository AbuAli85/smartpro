import { createClient } from "@supabase/supabase-js"
import type { UserRole } from "@/types/auth"

// Create a Supabase client for server-side auth checks
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

/**
 * Validate authentication for edge functions
 */
export async function validateAuth(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "Unauthorized: Missing or invalid token", status: 401, user: null }
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "")

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { error: "Unauthorized: Invalid token", status: 401, user: null }
    }

    // Get user role from database
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError) {
      console.error("Error fetching user role:", userError)
      return { error: "Unauthorized: User data not found", status: 401, user: null }
    }

    // Return the authenticated user with role
    return {
      error: null,
      status: 200,
      user: {
        ...user,
        role: userData?.role || user.user_metadata?.role || UserRole.USER,
      },
    }
  } catch (error) {
    console.error("Auth validation error:", error)
    return { error: "Unauthorized: Authentication failed", status: 401, user: null }
  }
}

/**
 * Check if a user has the required role
 */
export function hasRequiredRole(userRole: string | undefined, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false
  return requiredRoles.includes(userRole as UserRole)
}

/**
 * Validate request body against a schema
 */
export function validateRequest<T>(body: any, schema: any): { data: T | null; error: string | null } {
  try {
    const result = schema.parse(body)
    return { data: result, error: null }
  } catch (error: any) {
    console.error("Validation error:", error)
    return { data: null, error: error.message || "Invalid request data" }
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(message: string, status = 400): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(data: any): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set("Access-Control-Allow-Origin", "*")
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
