import { createClient } from "@supabase/supabase-js"

// Check if we're in a preview environment
const isPreviewEnvironment = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development"

// Create a mock Supabase client for preview environments
function createMockClient() {
  console.log("Creating mock Supabase client for preview environment")

  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({
            data: createMockData(table, value),
            error: null,
          }),
          order: (column: string, { ascending }: { ascending: boolean }) => ({
            data: [createMockData(table, value)],
            error: null,
          }),
        }),
        order: (column: string, { ascending }: { ascending: boolean }) => ({
          data: Array(5)
            .fill(0)
            .map(() => createMockData(table)),
          error: null,
        }),
      }),
      insert: (data: any) => ({
        select: (columns: string) => ({
          single: async () => ({
            data: { id: "mock-id-" + Math.random().toString(36).substring(2, 9) },
            error: null,
          }),
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          data: null,
          error: null,
        }),
      }),
    }),
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: File) => ({
          data: { path },
          error: null,
        }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: "/placeholder.svg?height=300&width=400" },
        }),
      }),
    },
    rpc: (fn: string, params: any) => ({
      data: createMockData(fn, params.contract_id),
      error: null,
    }),
    auth: {
      getUser: async () => ({
        data: { user: { id: "mock-user-id" } },
        error: null,
      }),
    },
  }
}

// Helper function to create mock data based on table name
function createMockData(table: string, id?: string) {
  const mockId = id || "mock-id-" + Math.random().toString(36).substring(2, 9)

  switch (table) {
    case "promoter_contracts":
      return {
        id: mockId,
        created_at: new Date().toISOString(),
        contract_data: {
          first_party_name_en: "Mock Company A",
          first_party_cr: "CR123456",
          second_party_name_en: "Mock Company B",
          second_party_cr: "CR789012",
          promoter_name_en: "John Doe",
          promoter_id: "ID123456",
          product_name_en: "Sample Product",
          location_name_en: "Sample Location",
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          id_photo_url: "/placeholder.svg?height=300&width=400",
          passport_photo_url: "/placeholder.svg?height=300&width=400",
          letterhead_image_url: "/placeholder.svg?height=150&width=300",
        },
        contract_layout: {
          version: "1.0",
          pages: [
            {
              letterhead_url: "/placeholder.svg?height=150&width=300",
              sections: [
                {
                  type: "title",
                  content: {
                    en: "PROMOTION AGREEMENT (MOCK)",
                    ar: "اتفاقية ترويج (نموذج)",
                  },
                },
              ],
            },
          ],
        },
      }
    case "approval_tokens":
      return {
        contract_id: mockId,
        token: "mock-token-" + Math.random().toString(36).substring(2, 9),
        party_role: Math.random() > 0.5 ? "first_party" : "second_party",
        party_name: Math.random() > 0.5 ? "Mock First Party" : "Mock Second Party",
        party_id: "CR" + Math.floor(Math.random() * 1000000),
        used: false,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    case "get_contract_layout":
      return {
        id: mockId,
        created_at: new Date().toISOString(),
        pages: [
          {
            letterhead_url: "/placeholder.svg?height=150&width=300",
            sections: [
              {
                type: "title",
                content: {
                  en: "PROMOTION AGREEMENT (MOCK)",
                  ar: "اتفاقية ترويج (نموذج)",
                },
              },
            ],
          },
        ],
      }
    default:
      return {
        id: mockId,
        created_at: new Date().toISOString(),
      }
  }
}

// Server-side Supabase client (for API routes and server actions)
export function getServerSupabaseClient() {
  // If we're in a preview environment, return a mock client
  if (isPreviewEnvironment) {
    return createMockClient()
  }

  // For production, use the real client
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase environment variables, using mock client")
    return createMockClient()
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Client-side Supabase client (for components)
export function getClientSupabaseClient() {
  // If we're in a preview environment, return a mock client
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))
  ) {
    return createMockClient()
  }

  // For production, use the real client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase environment variables, using mock client")
    return createMockClient()
  }

  return createClient(supabaseUrl, supabaseKey)
}
