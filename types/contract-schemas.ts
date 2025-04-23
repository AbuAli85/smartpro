import { z } from "zod"

// Base schemas for common fields
const bilingualTextSchema = z.object({
  en: z.string(),
  ar: z.string().optional(),
})

const dateSchema = z.string().refine((value) => !isNaN(Date.parse(value)), { message: "Invalid date format" })

// Contract party schema
const contractPartySchema = z.object({
  name: bilingualTextSchema,
  role: bilingualTextSchema,
  signature: z.string().optional(),
})

// Contract section schemas
const titleSectionSchema = z.object({
  type: z.literal("title"),
  content: bilingualTextSchema,
})

const textSectionSchema = z.object({
  type: z.literal("text"),
  content: bilingualTextSchema,
})

const noteSectionSchema = z.object({
  type: z.literal("note"),
  content: bilingualTextSchema,
})

const photoSectionSchema = z.object({
  type: z.literal("photo_section"),
  title: bilingualTextSchema,
  image_url: z.string().url(),
})

const signatureSectionSchema = z.object({
  type: z.literal("signature"),
  parties: z.array(contractPartySchema),
})

// Union of all section types
const sectionSchema = z.discriminatedUnion("type", [
  titleSectionSchema,
  textSectionSchema,
  noteSectionSchema,
  photoSectionSchema,
  signatureSectionSchema,
])

// Contract page schema
const contractPageSchema = z.object({
  letterhead_url: z.string().url().optional(),
  sections: z.array(sectionSchema),
})

// Contract metadata schema
const contractMetadataSchema = z.object({
  first_party_name: bilingualTextSchema,
  second_party_name: bilingualTextSchema,
  promoter_name: bilingualTextSchema,
  product_name: bilingualTextSchema,
  location_name: bilingualTextSchema,
  start_date: dateSchema,
  end_date: dateSchema,
})

// Full contract layout schema
export const contractLayoutSchema = z.object({
  id: z.string().uuid(),
  created_at: dateSchema,
  version: z.string().optional(),
  pages: z.array(contractPageSchema),
  metadata: contractMetadataSchema,
  contract_data: z.record(z.string(), z.any()).optional(),
})

// Create contract request schema
export const createContractSchema = z.object({
  first_party_name_en: z.string().min(2, "First party name must be at least 2 characters."),
  first_party_name_ar: z.string().optional(),
  first_party_cr: z.string().min(2, "First party CR is required."),
  second_party_name_en: z.string().min(2, "Second party name must be at least 2 characters."),
  second_party_name_ar: z.string().optional(),
  second_party_cr: z.string().min(2, "Second party CR is required."),
  promoter_name_en: z.string().min(2, "Promoter name must be at least 2 characters."),
  promoter_name_ar: z.string().optional(),
  promoter_id: z.string().min(2, "Promoter ID is required."),
  product_name_en: z.string().min(2, "Product name must be at least 2 characters."),
  product_name_ar: z.string().optional(),
  location_name_en: z.string().min(2, "Location must be at least 2 characters."),
  location_name_ar: z.string().optional(),
  start_date: z.string().refine((value) => !isNaN(Date.parse(value)), { message: "Invalid start date format" }),
  end_date: z.string().refine((value) => !isNaN(Date.parse(value)), { message: "Invalid end date format" }),
  template_id: z.string().optional(),
  letterhead_image_url: z.string().url(),
  id_photo_url: z.string().url(),
  passport_photo_url: z.string().url(),
  contract_text_en: z.string().optional(),
  contract_text_ar: z.string().optional(),
})

// Contract search input schema
export const contractSearchSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().optional().default(10),
  offset: z.number().int().nonnegative().optional().default(0),
  filters: z.record(z.string(), z.any()).optional(),
})

// Get contract layout input schema
export const getContractLayoutSchema = z.object({
  contractId: z.string().uuid(),
})

// Approve token input schema
export const approveTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
})

// Import merge preview input schema
export const importMergePreviewSchema = z.object({
  file: z.any(),
  fileType: z.enum(["json", "csv"]),
  options: z.record(z.string(), z.any()).optional(),
})

// Form placeholders schema
export const formPlaceholdersSchema = z.object({
  form_type: z.string().min(1),
  title: z.string(),
  title_ar: z.string().optional(),
  first_party_label: z.string(),
  first_party_label_ar: z.string().optional(),
  second_party_label: z.string(),
  second_party_label_ar: z.string().optional(),
  promoter_label: z.string(),
  promoter_label_ar: z.string().optional(),
  product_location_label: z.string(),
  product_location_label_ar: z.string().optional(),
  contract_period_label: z.string(),
  contract_period_label_ar: z.string().optional(),
  template_label: z.string(),
  template_label_ar: z.string().optional(),
  documents_label: z.string(),
  documents_label_ar: z.string().optional(),
})
