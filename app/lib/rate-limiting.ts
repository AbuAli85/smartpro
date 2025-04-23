import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

interface RateLimitOptions {
  limit: number
  window: number // in seconds
  identifier?: string
}

/**
 * Rate limiting middleware for Edge Functions
 */
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions,
): Promise<{ limited: boolean; response?: NextResponse; remaining: number }> {
  const { limit, window, identifier: customIdentifier } = options

  // Get client IP or custom identifier
  const identifier = customIdentifier || request.ip || "unknown"

  // Create a key for this rate limit
  const key = `ratelimit:${request.nextUrl.pathname}:${identifier}`

  try {
    // Get current count from Supabase
    const { data, error } = await supabase.from("rate_limits").select("count, expires_at").eq("key", key).single()

    const now = new Date()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error checking rate limit:", error)
      // If there's an error, allow the request but log it
      return { limited: false, remaining: limit }
    }

    // If no data or expired, create/reset the counter
    if (!data || new Date(data.expires_at) < now) {
      const expires = new Date(now.getTime() + window * 1000)

      await supabase.from("rate_limits").upsert({
        key,
        count: 1,
        expires_at: expires.toISOString(),
      })

      return { limited: false, remaining: limit - 1 }
    }

    // Check if limit is exceeded
    if (data.count >= limit) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          retryAfter: Math.ceil((new Date(data.expires_at).getTime() - now.getTime()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((new Date(data.expires_at).getTime() - now.getTime()) / 1000).toString(),
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(new Date(data.expires_at).getTime() / 1000).toString(),
          },
        },
      )

      return { limited: true, response, remaining: 0 }
    }

    // Increment the counter
    await supabase
      .from("rate_limits")
      .update({ count: data.count + 1 })
      .eq("key", key)

    return { limited: false, remaining: limit - data.count - 1 }
  } catch (error) {
    console.error("Unexpected error in rate limiting:", error)
    // If there's an unexpected error, allow the request but log it
    return { limited: false, remaining: limit }
  }
}
