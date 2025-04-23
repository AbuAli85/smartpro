import { v4 as uuidv4 } from "uuid"

// Define types for the contract template
export interface BilingualText {
  en: string
  ar: string
}

export interface ContractSection {
  title: BilingualText
  content: BilingualText
}

export interface ContractPage {
  page_number: number
  sections: ContractSection[]
}

export interface ContractTemplate {
  ref_number?: string
  letterhead_image_url: string
  id_card_photo_url: string
  passport_photo_url: string
  pages: ContractPage[]
}

// Function to generate a reference number
export function generateReferenceNumber(): string {
  const date = new Date()
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  const uniqueId = uuidv4().split("-")[0]

  return `PAC-${day}${month}${year}-${uniqueId}`
}

// Function to replace placeholders in the template with actual values
export function fillContractTemplate(template: ContractTemplate, data: Record<string, any>): ContractTemplate {
  // Create a deep copy of the template to avoid modifying the original
  const filledTemplate = JSON.parse(JSON.stringify(template)) as ContractTemplate

  // Generate a reference number if not provided
  if (!filledTemplate.ref_number) {
    filledTemplate.ref_number = generateReferenceNumber()
  }

  // Replace image URLs
  filledTemplate.letterhead_image_url = data.letterhead_image_url || template.letterhead_image_url
  filledTemplate.id_card_photo_url = data.id_photo_url || template.id_card_photo_url
  filledTemplate.passport_photo_url = data.passport_photo_url || template.passport_photo_url

  // Process each page and section
  filledTemplate.pages.forEach((page) => {
    page.sections.forEach((section) => {
      // Replace placeholders in titles
      section.title.en = replacePlaceholders(section.title.en, data)
      section.title.ar = replacePlaceholders(section.title.ar, data)

      // Replace placeholders in content
      section.content.en = replacePlaceholders(section.content.en, data)
      section.content.ar = replacePlaceholders(section.content.ar, data)
    })
  })

  return filledTemplate
}

// Helper function to replace placeholders in a string
function replacePlaceholders(text: string, data: Record<string, any>): string {
  // Define placeholder mappings
  const placeholderMap: Record<string, string> = {
    "[FIRST_PARTY_NAME_EN]": data.first_party_name_en || "",
    "[FIRST_PARTY_NAME_AR]": data.first_party_name_ar || data.first_party_name_en || "",
    "[SECOND_PARTY_NAME_EN]": data.second_party_name_en || "",
    "[SECOND_PARTY_NAME_AR]": data.second_party_name_ar || data.second_party_name_en || "",
    "[PRODUCT_NAME_EN]": data.product_name_en || "",
    "[PRODUCT_NAME_AR]": data.product_name_ar || data.product_name_en || "",
    "[LOCATION_EN]": data.location_name_en || "",
    "[LOCATION_AR]": data.location_name_ar || data.location_name_en || "",
    "[PROMOTER_NAME_EN]": data.promoter_name_en || "",
    "[PROMOTER_NAME_AR]": data.promoter_name_ar || data.promoter_name_en || "",
    "[PROMOTER_ID]": data.promoter_id || "",
    "[START_DATE]": data.start_date ? new Date(data.start_date).toLocaleDateString() : "",
    "[END_DATE]": data.end_date ? new Date(data.end_date).toLocaleDateString() : "",
    "[LETTERHEAD_IMAGE_URL]": data.letterhead_image_url || "",
    "[ID_CARD_PHOTO_URL]": data.id_photo_url || "",
    "[PASSPORT_PHOTO_URL]": data.passport_photo_url || "",
  }

  // Replace all placeholders
  let result = text
  for (const [placeholder, value] of Object.entries(placeholderMap)) {
    result = result.replace(new RegExp(placeholder, "g"), value)
  }

  return result
}

// Define the promoter assignment contract template
export const promoterAssignmentTemplate: ContractTemplate = {
  letterhead_image_url: "[LETTERHEAD_IMAGE_URL]",
  id_card_photo_url: "[ID_CARD_PHOTO_URL]",
  passport_photo_url: "[PASSPORT_PHOTO_URL]",
  pages: [
    {
      page_number: 1,
      sections: [
        {
          title: {
            en: "Promoter Assignment Contract",
            ar: "عقد تكليف مروج",
          },
          content: {
            en: "This contract is made between [FIRST_PARTY_NAME_EN] and [SECOND_PARTY_NAME_EN] regarding promotion of [PRODUCT_NAME_EN] at [LOCATION_EN].",
            ar: "تم إبرام هذا العقد بين [FIRST_PARTY_NAME_AR] و [SECOND_PARTY_NAME_AR] بخصوص الترويج لـ [PRODUCT_NAME_AR] في [LOCATION_AR].",
          },
        },
        {
          title: {
            en: "Responsibilities",
            ar: "المسؤوليات",
          },
          content: {
            en: "The promoter [PROMOTER_NAME_EN] with ID [PROMOTER_ID] agrees to perform duties as assigned by the second party from [START_DATE] to [END_DATE].",
            ar: "يوافق المروج [PROMOTER_NAME_AR] بهوية رقم [PROMOTER_ID] على أداء المهام المحددة من قبل الطرف الثاني من [START_DATE] إلى [END_DATE].",
          },
        },
        {
          title: {
            en: "Financial Terms",
            ar: "الشروط المالية",
          },
          content: {
            en: "Payment will be processed upon completion of tasks as agreed.",
            ar: "سيتم صرف الدفعة بعد إتمام المهام كما تم الاتفاق عليها.",
          },
        },
      ],
    },
    {
      page_number: 2,
      sections: [
        {
          title: {
            en: "Promoter ID Card",
            ar: "بطاقة هوية المروج",
          },
          content: {
            en: "ID Card of [PROMOTER_NAME_EN]",
            ar: "بطاقة هوية [PROMOTER_NAME_AR]",
          },
        },
        {
          title: {
            en: "Promoter Passport Copy",
            ar: "نسخة من جواز سفر المروج",
          },
          content: {
            en: "Passport of [PROMOTER_NAME_EN]",
            ar: "جواز سفر [PROMOTER_NAME_AR]",
          },
        },
        {
          title: {
            en: "Signatures",
            ar: "التوقيعات",
          },
          content: {
            en: "First Party: [FIRST_PARTY_NAME_EN]\nSecond Party: [SECOND_PARTY_NAME_EN]\nPromoter: [PROMOTER_NAME_EN]",
            ar: "الطرف الأول: [FIRST_PARTY_NAME_AR]\nالطرف الثاني: [SECOND_PARTY_NAME_AR]\nالمروج: [PROMOTER_NAME_AR]",
          },
        },
      ],
    },
  ],
}

// Export available templates
export const contractTemplates = {
  promoterAssignment: promoterAssignmentTemplate,
}

// Function to get contract templates for the form
export async function getContractTemplates() {
  return [{ id: "promoterAssignment", name: "Promoter Assignment Contract" }]
}
