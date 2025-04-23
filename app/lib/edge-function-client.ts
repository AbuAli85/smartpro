/**
 * Edge Function client for Supabase
 * Handles secure communication with Edge Functions using Supabase's invoke method
 */

import { isAuthenticated, getCurrentUser, getAccessToken } from "./auth-utils"
import { createClient } from "@supabase/supabase-js"
import { UserRole } from "@/types/auth"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance && typeof window !== "undefined") {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

function getClientSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Update the callEdgeFunction function to include role-based authorization
export async function callEdgeFunction<T = any, P = any>(
  functionName: string,
  payload?: P,
  options?: RequestInit & { requireAuth?: boolean; requiredRole?: UserRole | UserRole[] },
): Promise<T> {
  // Extract requireAuth and requiredRole from options, defaulting to true for requireAuth
  const { requireAuth = true, requiredRole, ...fetchOptions } = options || {}

  // Check if user is authenticated when required
  if (requireAuth && !isAuthenticated()) {
    throw new Error("Authentication required to call Edge Functions")
  }

  // Get the current user if authenticated
  const user = requireAuth ? getCurrentUser() : null

  // Check if user has required role when specified
  if (requiredRole && user?.role) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role as UserRole)
      : user.role === requiredRole

    if (!hasRequiredRole) {
      throw new Error(
        `Unauthorized: Required role ${Array.isArray(requiredRole) ? requiredRole.join(" or ") : requiredRole}`,
      )
    }
  }

  // Get the Supabase client
  const supabase = getClientSupabaseClient()

  // Get the current access token if authenticated
  const token = requireAuth ? await getAccessToken() : null

  try {
    // Call the Edge Function using Supabase's invoke method
    const { data, error } = await supabase.functions.invoke<T>(functionName, {
      body: payload,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      ...fetchOptions,
    })

    if (error) {
      console.error(`Error calling Edge Function ${functionName}:`, error)
      throw new Error(error.message || `Error calling ${functionName}`)
    }

    return data
  } catch (error) {
    console.error(`Error calling Edge Function ${functionName}:`, error)
    throw error
  }
}

/**
 * File upload to Edge Function
 */
export async function uploadFile(file: File, bucketName: string, folderPath: string): Promise<{ fileUrl: string }> {
  // Convert file to base64 for transmission
  const base64 = await fileToBase64(file)

  return callEdgeFunction("upload-file", {
    file: base64,
    fileName: file.name,
    mimeType: file.type,
    bucketName,
    folderPath,
  })
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Contract-related Edge Functions
 */
export const contractFunctions = {
  // Create a new contract
  createContract: async (contractData: any): Promise<{ contractId: string }> => {
    return callEdgeFunction("create-contract", contractData, {
      requiredRole: [UserRole.ADMIN, UserRole.COMPANY],
    })
  },

  // Get contract by ID
  getContract: async (contractId: string): Promise<any> => {
    return callEdgeFunction("get-contract", { contractId })
  },

  // Search contracts
  searchContracts: async (params: { query?: string; filters?: any; limit?: number; offset?: number }): Promise<any> => {
    return callEdgeFunction("search-contracts", params)
  },

  // Approve contract token
  approveToken: async (token: string): Promise<{ contractId: string }> => {
    return callEdgeFunction(
      "approve-token",
      { token },
      {
        requireAuth: false, // Token-based auth, not JWT
      },
    )
  },

  // Get contract templates
  getContractTemplates: async (): Promise<any[]> => {
    return callEdgeFunction("get-contract-templates")
  },

  // Get form placeholders
  getFormPlaceholders: async (formType: string): Promise<any> => {
    // Check if we're in a preview environment
    const isPreview =
      typeof window !== "undefined" &&
      (process.env.VERCEL_ENV === "preview" ||
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost" ||
        window.location.hostname.includes("vercel.app"))

    if (isPreview) {
      console.log("Preview environment detected in getFormPlaceholders, returning default placeholders")
      // Return default placeholders for preview environments
      return {
        id: 0,
        form_type: formType,
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
      }
    }

    // For production, call the actual Edge Function
    return callEdgeFunction("get-form-placeholders", { formType })
  },

  // Update form placeholders
  updateFormPlaceholders: async (formType: string, placeholders: any): Promise<void> => {
    return callEdgeFunction(
      "update-form-placeholders",
      { formType, placeholders },
      {
        requiredRole: UserRole.ADMIN,
      },
    )
  },

  // Create form placeholders
  createFormPlaceholders: async (formType: string, placeholders: any): Promise<void> => {
    return callEdgeFunction(
      "create-form-placeholders",
      { formType, placeholders },
      {
        requiredRole: UserRole.ADMIN,
      },
    )
  },

  // Generate contract layout
  generateContractLayout: async (contractData: any): Promise<any> => {
    return callEdgeFunction("generate-contract-layout", contractData)
  },

  // Generate Figma JSON
  generateFigmaJson: async (contractId: string): Promise<any> => {
    return callEdgeFunction(
      "generate-figma-json",
      { contractId },
      {
        requiredRole: UserRole.ADMIN,
      },
    )
  },
}

/**
 * Document processing Edge Functions
 */
export const documentFunctions = {
  // Process document
  processDocument: async (documentData: any): Promise<any> => {
    return callEdgeFunction("process-document", documentData)
  },

  // Import and merge preview
  importMergePreview: async (fileData: any): Promise<any> => {
    return callEdgeFunction("import-merge-preview", fileData, {
      requiredRole: [UserRole.ADMIN, UserRole.COMPANY],
    })
  },
}

/**
 * Quick processor function
 */
export function callQuickProcessor(data: any): Promise<any> {
  return callEdgeFunction("quick-processor", data)
}

/**
 * Generate contract function
 */
export function generateContract(contractId: string): Promise<any> {
  return callEdgeFunction("generate-contract", { contract_id: contractId })
}

// Export all functions as a single object for convenience
export const edgeFunctions = {
  callEdgeFunction,
  uploadFile,
  contract: contractFunctions,
  document: documentFunctions,
  callQuickProcessor,
  generateContract,
}

export default edgeFunctions
