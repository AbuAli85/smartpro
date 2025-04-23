import { getAuthHeaders, isAuthenticated, clearAuthTokens } from "./auth-utils"
import { UserRole } from "@/types/auth"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Generic function to invoke Supabase Edge Functions
async function invokeFunction<T = any, P = any>(
  functionName: string,
  payload?: P,
  options?: {
    requireAuth?: boolean
    requiredRole?: UserRole | UserRole[]
  },
): Promise<T> {
  const { requireAuth = true, requiredRole } = options || {}

  // Check authentication if required
  if (requireAuth && !isAuthenticated()) {
    throw new Error("Authentication required")
  }

  try {
    // Get auth headers
    const headers = await getAuthHeaders()

    // Get Supabase client
    const supabase = getSupabaseClient()

    // Invoke the function
    const { data, error } = await supabase.functions.invoke<T>(functionName, {
      body: payload,
      headers,
    })

    if (error) {
      // Handle authentication errors
      if (error.status === 401) {
        clearAuthTokens()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        throw new Error("Authentication failed")
      }

      // Handle authorization errors
      if (error.status === 403) {
        throw new Error("You don't have permission to perform this action")
      }

      throw error
    }

    return data as T
  } catch (error) {
    console.error(`Error invoking function ${functionName}:`, error)
    throw error
  }
}

// Contract API functions
export const contractApi = {
  // Create a new promoter contract
  createPromoterContract: async (contractData: any) => {
    return invokeFunction("create-promoter-contract", contractData, {
      requiredRole: [UserRole.ADMIN, UserRole.COMPANY],
    })
  },

  // Search contracts with fuzzy matching on metadata
  searchContracts: async (params: {
    query?: string
    limit?: number
    offset?: number
    filters?: Record<string, any>
  }) => {
    return invokeFunction("contract-search", params)
  },

  // Get contract by ID
  getContract: async (contractId: string) => {
    return invokeFunction("get-contract-layout", { contractId })
  },

  // Import and merge preview for uploads
  importMergePreview: async (fileData: FormData) => {
    return invokeFunction("import-merge-preview", fileData, {
      requiredRole: [UserRole.ADMIN, UserRole.COMPANY],
    })
  },

  // Approve contract token
  approveToken: async (token: string) => {
    return invokeFunction(
      "approve-token",
      { token },
      {
        requireAuth: false, // Token-based auth, not JWT
      },
    )
  },

  // Regenerate contract JSON for Figma
  regenerateContractJson: async (contractId: string) => {
    return invokeFunction(
      "regenerate-contract-json",
      { contractId },
      {
        requiredRole: UserRole.ADMIN,
      },
    )
  },

  // Get contract templates
  getContractTemplates: async () => {
    return invokeFunction("get-contract-templates")
  },

  // Get form placeholders
  getFormPlaceholders: async (formType: string) => {
    return invokeFunction("get-form-placeholders", { formType })
  },

  // Update form placeholders
  updateFormPlaceholders: async (formType: string, placeholders: any) => {
    return invokeFunction("update-form-placeholders", { formType, placeholders }, { requiredRole: UserRole.ADMIN })
  },
}

export default contractApi
