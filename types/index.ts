import type { Database } from "./supabase"

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]

export interface PlaceholderConfig {
  docx_tag: string // e.g., "promoter_name"
  label: string // e.g., "Promoter Name"
  type?: "text" | "textarea" | "date" | "number" | "select" // Default to "text" or "select" if source_table is present
  source_table?: keyof Database["public"]["Tables"] // e.g., "promoters"
  source_value_column?: string // e.g., "id" (column to store)
  source_display_column?: string // e.g., "name" (column to show in dropdown)
  required?: boolean
}

export interface Template extends Tables<"templates"> {
  placeholders_config: PlaceholderConfig[] | null
}

export interface Company extends Tables<"companies"> {}
export interface Promoter extends Tables<"promoters"> {}

export interface Contract extends Tables<"contracts"> {
  template?: Template // For joining data
  user?: Tables<"profiles"> // For joining data
}

export interface SelectOption {
  value: string
  label: string
}
