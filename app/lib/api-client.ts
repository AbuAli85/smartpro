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

// At the top of the file, add this function to detect preview environments
function isPreviewEnvironment() {
  return (
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app")))
  )
}

// Add this function to generate mock contract data
function generateMockContracts(count = 10) {
  return Array(count)
    .fill(0)
    .map((_, i) => ({
      id: `mock-id-${i}`,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      first_party: {
        name: `Company A${i}`,
        name_ar: `الشركة أ${i}`,
        crn: `CR${100000 + i}`,
        logo_url: "/placeholder.svg?height=40&width=40",
      },
      second_party: {
        name: `Company B${i}`,
        name_ar: `الشركة ب${i}`,
        crn: `CR${200000 + i}`,
      },
      promoter: {
        name: `Promoter ${i}`,
        name_ar: `المروج ${i}`,
        count: Math.floor(Math.random() * 5) + 1,
      },
      product: {
        name: `Product ${i}`,
        name_ar: `المنتج ${i}`,
      },
      start_date: new Date(Date.now() - i * 86400000).toISOString(),
      end_date: new Date(Date.now() + (30 - i) * 86400000).toISOString(),
      status: i % 3 === 0 ? "active" : i % 3 === 1 ? "pending" : "draft",
    }))
}

// Modify the invokeFunction to handle preview environments
async function invokeFunction<T = any, P = any>(
  functionName: string,
  payload?: P,
  options?: {
    requireAuth?: boolean
    requiredRole?: UserRole | UserRole[]
  },
): Promise<T> {
  const { requireAuth = true, requiredRole } = options || {}

  // If in preview environment, return mock data
  if (isPreviewEnvironment()) {
    console.log(`Preview environment detected, returning mock data for ${functionName}`)

    // Return mock data based on the function name
    if (functionName === "contract-search") {
      const { limit = 10 } = (payload as any) || {}
      return {
        contracts: generateMockContracts(limit),
        total: 42,
        limit,
        offset: 0,
      } as unknown as T
    }

    if (functionName === "get-contract-layout") {
      const { contractId } = (payload as any) || {}
      return {
        id: contractId || "mock-id",
        created_at: new Date().toISOString(),
        pages: [
          {
            letterhead_url: "/placeholder.svg?height=150&width=300",
            sections: [
              {
                type: "title",
                content: {
                  en: "MOCK CONTRACT",
                  ar: "عقد وهمي",
                },
              },
              {
                type: "text",
                content: {
                  en: "This is a mock contract for preview purposes.",
                  ar: "هذا عقد وهمي لأغراض المعاينة.",
                },
              },
            ],
          },
        ],
      } as unknown as T
    }

    if (functionName === "get-contract-templates") {
      return [
        { id: "template1", name: "Standard Contract" },
        { id: "template2", name: "Promoter Agreement" },
      ] as unknown as T
    }

    if (functionName === "get-form-placeholders") {
      return {
        id: 1,
        form_type: "contract_form",
        title: "Create Bilingual Contract",
        title_ar: "إنشاء عقد ثنائي اللغة",
        first_party_label: "First Party Information",
        first_party_label_ar: "معلومات الطرف الأول",
        second_party_label: "Second Party Information",
        second_party_label_ar: "معلومات الطرف الثاني",
        promoter_label: "Promoter Information",
        promoter_label_ar: "معلومات المروج",
        product_location_label: "Product and Location",
        product_location_label_ar: "المنتج والموقع",
        contract_period_label: "Contract Period",
        contract_period_label_ar: "مدة العقد",
        template_label: "Contract Template",
        template_label_ar: "نموذج العقد",
        documents_label: "Documents",
        documents_label_ar: "المستندات",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as T
    }

    // Default mock response
    return { success: true, message: "Mock response for preview environment" } as unknown as T
  }

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
