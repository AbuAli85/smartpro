import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type Contract = Database["public"]["Tables"]["contracts"]["Row"]
export type ContractInsert = Database["public"]["Tables"]["contracts"]["Insert"]
export type ContractUpdate = Database["public"]["Tables"]["contracts"]["Update"]

// Client-side operations
export const contractService = {
  async createContract(contract: ContractInsert) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("contracts").insert(contract).select().single()

    if (error) throw error
    return data
  },

  async updateContract(id: string, updates: ContractUpdate) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("contracts").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async deleteContract(id: string) {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("contracts").delete().eq("id", id)

    if (error) throw error
    return true
  },

  async getContractById(id: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("contracts").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async getUserContracts(userId: string, page = 1, limit = 10) {
    const supabase = getSupabaseClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("contracts")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  async searchContracts(userId: string, query: string, page = 1, limit = 10) {
    const supabase = getSupabaseClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("contracts")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .or(`first_party_name.ilike.%${query}%,second_party_name.ilike.%${query}%,reference_number.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  // Update contract with PDF URL
  async updateContractWithPdf(id: string, pdfUrl: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("contracts")
      .update({
        pdf_url: pdfUrl,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Server-side operations
export const serverContractService = {
  async getUserContracts(userId: string, page = 1, limit = 10) {
    const supabase = getSupabaseServer()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("contracts")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  async getContractById(id: string) {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase.from("contracts").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },
}
