import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"
import { ApprovalStatus } from "@/types/template"

export type Template = Database["public"]["Tables"]["templates"]["Row"]
export type TemplateInsert = Database["public"]["Tables"]["templates"]["Insert"]
export type TemplateUpdate = Database["public"]["Tables"]["templates"]["Update"]
export type TemplateVersion = Database["public"]["Tables"]["template_versions"]["Row"]
export type TemplateVersionInsert = Database["public"]["Tables"]["template_versions"]["Insert"]

// Client-side operations
export const templateService = {
  async createTemplate(template: TemplateInsert) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("templates").insert(template).select().single()

    if (error) throw error
    return data
  },

  async updateTemplate(id: string, updates: TemplateUpdate) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("templates").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async deleteTemplate(id: string) {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("templates").delete().eq("id", id)

    if (error) throw error
    return true
  },

  async getTemplateById(id: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("templates").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async getUserTemplates(userId: string, page = 1, limit = 10) {
    const supabase = getSupabaseClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("templates")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  async getPublishedTemplates(page = 1, limit = 10) {
    const supabase = getSupabaseClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("templates")
      .select("*", { count: "exact" })
      .eq("is_published", true)
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  async getTemplatesByCategory(category: string, page = 1, limit = 10) {
    const supabase = getSupabaseClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("templates")
      .select("*", { count: "exact" })
      .eq("category", category)
      .eq("is_published", true)
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  async searchTemplates(query: string, page = 1, limit = 10) {
    const supabase = getSupabaseClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("templates")
      .select("*", { count: "exact" })
      .eq("is_published", true)
      .eq("approval_status", "approved")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,responsibilities.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  async getPendingApprovalTemplates(page = 1, limit = 10) {
    const supabase = getSupabaseClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("templates")
      .select("*", { count: "exact" })
      .eq("approval_status", "pending_approval")
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  // Template versioning
  async createTemplateVersion(version: TemplateVersionInsert) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("template_versions").insert(version).select().single()

    if (error) throw error
    return data
  },

  async getTemplateVersions(templateId: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("template_versions")
      .select("*")
      .eq("template_id", templateId)
      .order("version", { ascending: false })

    if (error) throw error
    return data
  },

  // Approval workflow
  async submitForApproval(templateId: string, username: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("templates")
      .update({
        approval_status: ApprovalStatus.PendingApproval,
        approval_requested_at: new Date().toISOString(),
        approval_requested_by: username,
        updated_at: new Date().toISOString(),
        last_modified_by: username,
      })
      .eq("id", templateId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async approveTemplate(templateId: string, comments: string, username: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("templates")
      .update({
        approval_status: ApprovalStatus.Approved,
        approved_at: new Date().toISOString(),
        approved_by: username,
        approval_comments: comments,
        is_published: true,
        updated_at: new Date().toISOString(),
        last_modified_by: username,
      })
      .eq("id", templateId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async rejectTemplate(templateId: string, comments: string, username: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("templates")
      .update({
        approval_status: ApprovalStatus.Rejected,
        rejected_at: new Date().toISOString(),
        rejected_by: username,
        approval_comments: comments,
        updated_at: new Date().toISOString(),
        last_modified_by: username,
      })
      .eq("id", templateId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Server-side operations
export const serverTemplateService = {
  async getPublishedTemplates(page = 1, limit = 10) {
    const supabase = getSupabaseServer()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("templates")
      .select("*", { count: "exact" })
      .eq("is_published", true)
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  async getTemplateById(id: string) {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase.from("templates").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },
}
