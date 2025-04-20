import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

export type Notification = Database["public"]["Tables"]["notifications"]["Row"]
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"]
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"]
export type ReadReceipt = Database["public"]["Tables"]["read_receipts"]["Row"]
export type ReadReceiptInsert = Database["public"]["Tables"]["read_receipts"]["Insert"]

// Client-side operations
export const notificationService = {
  async createNotification(notification: NotificationInsert) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("notifications").insert(notification).select().single()

    if (error) throw error
    return data
  },

  async updateNotification(id: string, updates: NotificationUpdate) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("notifications").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async deleteNotification(id: string) {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("notifications").delete().eq("id", id)

    if (error) throw error
    return true
  },

  async markAsRead(id: string, userId: string, deviceInfo?: string) {
    const supabase = getSupabaseClient()

    // First update the notification
    const { data, error } = await supabase.from("notifications").update({ read: true }).eq("id", id).select().single()

    if (error) throw error

    // Then create a read receipt if this notification requires it
    if (data.requires_read_receipt) {
      const receipt: ReadReceiptInsert = {
        notification_id: id,
        user_id: userId,
        device_info: deviceInfo || navigator.userAgent,
      }

      const { error: receiptError } = await supabase.from("read_receipts").insert(receipt)

      if (receiptError) throw receiptError
    }

    return data
  },

  async markAllAsRead(userId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)
      .select()

    if (error) throw error
    return data
  },

  async getUserNotifications(userId: string, page = 1, limit = 10) {
    const supabase = getSupabaseClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },

  async getUnreadNotifications(userId: string) {
    const supabase = getSupabaseClient()

    const { data, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("read", false)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { data, count }
  },

  async getImportantNotifications(userId: string) {
    const supabase = getSupabaseClient()

    const { data, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("important", true)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { data, count }
  },

  async getReadReceipts(notificationId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("read_receipts")
      .select("*")
      .eq("notification_id", notificationId)
      .order("created_at", { ascending: true })

    if (error) throw error
    return data
  },

  async clearExpiredNotifications(userId: string) {
    const supabase = getSupabaseClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .lt("expires_at", now)
      .select()

    if (error) throw error
    return data
  },
}

// Server-side operations
export const serverNotificationService = {
  async getUserNotifications(userId: string, page = 1, limit = 10) {
    const supabase = getSupabaseServer()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data, count }
  },
}
