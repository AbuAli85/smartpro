// This file provides a mock implementation of the Supabase server client
// In a real application, this would use @supabase/auth-helpers-nextjs

// Define a proper Session type to avoid TypeScript errors
type User = {
  id: string
  email?: string
}

type Session = {
  user: User
}

export const getSupabaseServer = () => {
  console.warn("Using placeholder Supabase server client")

  return {
    auth: {
      getSession: async () => ({ data: { session: null as Session | null } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null }),
        }),
      }),
    }),
  }
}
