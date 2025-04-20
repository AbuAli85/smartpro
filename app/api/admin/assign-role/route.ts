import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Supabase
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Parse the request body
    const body = await request.json()
    const { userId, role } = body

    // Validate required fields
    if (!userId || !role) {
      return NextResponse.json({ error: "Missing required fields: userId and role" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["user", "approver", "admin"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be one of: user, approver, admin" }, { status: 400 })
    }

    // Prevent changing own role
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
    }

    // Update user profile with new role
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating user role:", updateError)
      return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Role updated successfully to ${role}`,
    })
  } catch (error) {
    console.error("Error in assign-role API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
