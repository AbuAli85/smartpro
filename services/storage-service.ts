import { getSupabaseClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

export const storageService = {
  async uploadSignature(userId: string, base64Image: string): Promise<string> {
    // Convert base64 to blob
    const base64Response = await fetch(base64Image)
    const blob = await base64Response.blob()

    // Generate unique filename
    const filename = `${userId}/${uuidv4()}.png`

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.storage.from("signatures").upload(filename, blob, {
      contentType: "image/png",
      upsert: false,
    })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage.from("signatures").getPublicUrl(data.path)

    return urlData.publicUrl
  },

  async uploadStamp(userId: string, base64Image: string): Promise<string> {
    // Convert base64 to blob
    const base64Response = await fetch(base64Image)
    const blob = await base64Response.blob()

    // Generate unique filename
    const filename = `${userId}/${uuidv4()}.png`

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.storage.from("stamps").upload(filename, blob, {
      contentType: "image/png",
      upsert: false,
    })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage.from("stamps").getPublicUrl(data.path)

    return urlData.publicUrl
  },

  async uploadPdf(userId: string, pdfBlob: Blob): Promise<string> {
    // Generate unique filename
    const filename = `${userId}/${uuidv4()}.pdf`

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.storage.from("contracts").upload(filename, pdfBlob, {
      contentType: "application/pdf",
      upsert: false,
    })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage.from("contracts").getPublicUrl(data.path)

    return urlData.publicUrl
  },
}
