// Existing interfaces
export interface CreatePromoterContractRequest {
  first_party_id: string
  second_party_id: string
  promoter_id: string
  product_id: string
  location_id: string
  start_date: string
  end_date: string
}

export interface CreatePromoterContractResponse {
  success: boolean
  contractId: string
  refNumber: string
  layout: any
}

// New interfaces for PDF-related endpoints
export interface GeneratePdfRequest {
  contractId: string
  options?: {
    includeSignatures?: boolean
    includeWatermark?: boolean
    language?: "en" | "ar" | "both"
    paperSize?: "a4" | "letter"
    orientation?: "portrait" | "landscape"
  }
}

export interface GeneratePdfResponse {
  success: boolean
  pdfUrl: string
  fileName: string
  expiresAt?: string
}

export interface ContractSignatureRequest {
  contractId: string
  partyRole: "first_party" | "second_party" | "promoter"
  signatureData: string // Base64 encoded signature image
  signedBy: string
  signedAt?: string
}

export interface ContractSignatureResponse {
  success: boolean
  contractId: string
  signatureId: string
  updatedContract: any
}

export interface ContractLayoutPage {
  letterhead_url?: string
  sections: ContractSection[]
}

export interface ContractSection {
  type: "title" | "text" | "note" | "photo_section" | "signature"
  content?: BilingualText
  title?: BilingualText
  image_url?: string
  parties?: ContractParty[]
}

export interface ContractParty {
  name: BilingualText
  role: BilingualText
  signature?: string
}

export interface BilingualText {
  en: string
  ar?: string
}

export interface ImportMergePreviewResponse {
  preview: any[]
  totalItems: number
  duplicates: any[]
  errors: string[]
}

export interface ContractSearchInput {
  query?: string
  filters?: Record<string, any>
  limit?: number
  offset?: number
}

export interface ContractSearchResponse {
  contracts: any[]
  total: number
  limit: number
  offset: number
}
