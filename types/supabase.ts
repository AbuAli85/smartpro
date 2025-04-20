export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      contracts: {
        Row: {
          id: string
          user_id: string
          reference_number: string
          contract_type: string
          first_party_name: string
          second_party_name: string
          start_date: string
          end_date: string
          responsibilities: string
          signature: string
          stamp: string | null
          language: string
          created_at: string
          updated_at: string
          status: string
          pdf_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          reference_number: string
          contract_type: string
          first_party_name: string
          second_party_name: string
          start_date: string
          end_date: string
          responsibilities: string
          signature: string
          stamp?: string | null
          language: string
          created_at?: string
          updated_at?: string
          status?: string
          pdf_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          reference_number?: string
          contract_type?: string
          first_party_name?: string
          second_party_name?: string
          start_date?: string
          end_date?: string
          responsibilities?: string
          signature?: string
          stamp?: string | null
          language?: string
          created_at?: string
          updated_at?: string
          status?: string
          pdf_url?: string | null
        }
      }
      templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          contract_type: string
          responsibilities: string
          default_duration: number | null
          category: string
          version: number
          created_at: string
          updated_at: string
          created_by: string
          last_modified_by: string | null
          approval_status: string
          approval_requested_at: string | null
          approval_requested_by: string | null
          approved_at: string | null
          approved_by: string | null
          rejected_at: string | null
          rejected_by: string | null
          approval_comments: string | null
          is_published: boolean
          is_default: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          contract_type: string
          responsibilities: string
          default_duration?: number | null
          category: string
          version?: number
          created_at?: string
          updated_at?: string
          created_by: string
          last_modified_by?: string | null
          approval_status?: string
          approval_requested_at?: string | null
          approval_requested_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          approval_comments?: string | null
          is_published?: boolean
          is_default?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          contract_type?: string
          responsibilities?: string
          default_duration?: number | null
          category?: string
          version?: number
          created_at?: string
          updated_at?: string
          created_by?: string
          last_modified_by?: string | null
          approval_status?: string
          approval_requested_at?: string | null
          approval_requested_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          approval_comments?: string | null
          is_published?: boolean
          is_default?: boolean
        }
      }
      template_versions: {
        Row: {
          id: string
          template_id: string
          version: number
          name: string
          description: string | null
          contract_type: string
          responsibilities: string
          default_duration: number | null
          category: string
          created_at: string
          created_by: string
          change_notes: string | null
          approval_status: string | null
        }
        Insert: {
          id?: string
          template_id: string
          version: number
          name: string
          description?: string | null
          contract_type: string
          responsibilities: string
          default_duration?: number | null
          category: string
          created_at?: string
          created_by: string
          change_notes?: string | null
          approval_status?: string | null
        }
        Update: {
          id?: string
          template_id?: string
          version?: number
          name?: string
          description?: string | null
          contract_type?: string
          responsibilities?: string
          default_duration?: number | null
          category?: string
          created_at?: string
          created_by?: string
          change_notes?: string | null
          approval_status?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          message: string
          created_at: string
          read: boolean
          important: boolean
          requires_read_receipt: boolean
          expires_at: string | null
          category: string | null
          related_item_id: string | null
          related_item_type: string | null
          template_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          message: string
          created_at?: string
          read?: boolean
          important?: boolean
          requires_read_receipt?: boolean
          expires_at?: string | null
          category?: string | null
          related_item_id?: string | null
          related_item_type?: string | null
          template_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          message?: string
          created_at?: string
          read?: boolean
          important?: boolean
          requires_read_receipt?: boolean
          expires_at?: string | null
          category?: string | null
          related_item_id?: string | null
          related_item_type?: string | null
          template_id?: string | null
        }
      }
      read_receipts: {
        Row: {
          id: string
          notification_id: string
          user_id: string
          created_at: string
          device_info: string | null
        }
        Insert: {
          id?: string
          notification_id: string
          user_id: string
          created_at?: string
          device_info?: string | null
        }
        Update: {
          id?: string
          notification_id?: string
          user_id?: string
          created_at?: string
          device_info?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          preferred_language: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          preferred_language?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          preferred_language?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
