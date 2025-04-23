"use server"

import { revalidatePath } from "next/cache"
import { edgeFunctions } from "./lib/edge-function-client"
import { cookies } from "next/headers"

type UserRole = "admin" | "user"

function hasPermission(userRole: UserRole, permission: string): boolean {
  if (userRole === "admin") {
    return true
  }

  if (permission === "create_contracts" && userRole === "user") {
    return false
  }

  return false
}

// Create a new contract using Edge Function
export async function createContract(values: any) {
  try {
    // Check if we have an auth token in cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get("lovable_access_token")
    const userRole = cookieStore.get("user_role")?.value

    if (!authToken) {
      return {
        success: false,
        error: "Authentication required to create contracts",
      }
    }

    // Check if user has permission to create contracts
    if (!userRole || !hasPermission(userRole as UserRole, "create_contracts")) {
      return {
        success: false,
        error: "You don't have permission to create contracts",
      }
    }

    // Create contract using Edge Function
    const result = await edgeFunctions.contract.createContract(values)

    // Revalidate the contracts page
    revalidatePath("/contracts")

    return {
      success: true,
      contractId: result.contractId,
    }
  } catch (error) {
    console.error("Error creating contract:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Approve a contract token using Edge Function
export async function approveToken(token: string) {
  try {
    const result = await edgeFunctions.contract.approveToken(token)

    return {
      success: true,
      contractId: result.contractId,
    }
  } catch (error) {
    console.error("Error approving token:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
