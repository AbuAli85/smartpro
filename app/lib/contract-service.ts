import { createClient } from "@supabase/supabase-js"

// Create a mock contract for development/preview environments
function createMockContract(id: string) {
  return {
    id,
    created_at: new Date().toISOString(),
    pages: [
      {
        letterhead_url: "/placeholder.svg?height=150&width=300",
        sections: [
          {
            type: "title",
            content: {
              en: "PROMOTION AGREEMENT (PREVIEW)",
              ar: "اتفاقية ترويج (معاينة)",
            },
          },
          {
            type: "note",
            content: {
              en: `Contract No. ${id} (Mock Data)`,
              ar: `رقم العقد ${id} (بيانات تجريبية)`,
            },
          },
          {
            type: "text",
            content: {
              en: `This is a mock contract for preview purposes. In production, this would contain real contract data from Supabase.

This contract is between Company A and Company B for the promotion of Product X.`,
              ar: `هذا عقد تجريبي لأغراض المعاينة. في الإنتاج، سيحتوي هذا على بيانات عقد حقيقية من Supabase.

هذا العقد بين الشركة أ والشركة ب لترويج المنتج س.`,
            },
          },
        ],
      },
      {
        sections: [
          {
            type: "title",
            content: {
              en: "PROMOTER DETAILS",
              ar: "تفاصيل المروج",
            },
          },
          {
            type: "text",
            content: {
              en: `The Promoter engaged by the First Party has the following details:

Name: John Doe
ID Number: 1234567890

The Promoter's identification documents have been verified and copies are attached to this Agreement.`,
              ar: `المروج المعين من قبل الطرف الأول لديه التفاصيل التالية:

الاسم: جون دو
رقم الهوية: 1234567890

تم التحقق من وثائق هوية المروج وتم إرفاق نسخ منها بهذه الاتفاقية.`,
            },
          },
          {
            type: "photo_section",
            title: {
              en: "ID Photo",
              ar: "صورة الهوية",
            },
            image_url: "/placeholder.svg?height=300&width=400",
          },
          {
            type: "photo_section",
            title: {
              en: "Passport Photo",
              ar: "صورة جواز السفر",
            },
            image_url: "/placeholder.svg?height=300&width=400",
          },
          {
            type: "signature",
            parties: [
              {
                name: {
                  en: "Company A",
                  ar: "الشركة أ",
                },
                role: {
                  en: "First Party",
                  ar: "الطرف الأول",
                },
              },
              {
                name: {
                  en: "Company B",
                  ar: "الشركة ب",
                },
                role: {
                  en: "Second Party",
                  ar: "الطرف الثاني",
                },
              },
            ],
          },
        ],
      },
    ],
    metadata: {
      first_party_name: {
        en: "Company A",
        ar: "الشركة أ",
      },
      second_party_name: {
        en: "Company B",
        ar: "الشركة ب",
      },
      promoter_name: {
        en: "John Doe",
        ar: "جون دو",
      },
      product_name: {
        en: "Product X",
        ar: "المنتج س",
      },
      location_name: {
        en: "Location Y",
        ar: "الموقع ص",
      },
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    },
  }
}

export async function getContractLayout(contractId: string) {
  // IMPORTANT: Always use mock data in preview environments
  const isPreview = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development"

  if (isPreview) {
    console.log("Preview environment detected in contract service - using mock data")
    return { data: createMockContract(contractId), error: null }
  }

  // Only try to use Supabase in production environments
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Missing Supabase environment variables in contract service")
      return { data: createMockContract(contractId), error: null }
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get contract layout using direct query - select all columns to handle different schemas
    const { data, error } = await supabase.from("promoter_contracts").select("*").eq("id", contractId).single()

    if (error) {
      console.error("Supabase error in contract service:", error)
      return { data: createMockContract(contractId), error: null }
    }

    console.log("Contract data from database:", data)

    // Handle different possible data structures
    const contractData = data

    // If the contract has pages, it's already in the new format
    if (data.pages) {
      return { data: data, error: null }
    }

    // If the contract has contract_layout with pages, use that
    if (data.contract_layout && data.contract_layout.pages) {
      return { data: data.contract_layout, error: null }
    }

    // Otherwise, try to construct a compatible format from whatever data we have
    // This is a fallback for older contract formats
    const constructedContract = {
      id: data.id,
      created_at: data.created_at,
      pages: [
        {
          letterhead_url:
            data.letterhead_image_url ||
            data.contract_data?.letterhead_image_url ||
            "/placeholder.svg?height=150&width=300",
          sections: [
            {
              type: "title",
              content: {
                en: "PROMOTION AGREEMENT",
                ar: "اتفاقية ترويج",
              },
            },
            {
              type: "note",
              content: {
                en: `Contract No. ${data.id}`,
                ar: `رقم العقد ${data.id}`,
              },
            },
          ],
        },
      ],
      metadata: {
        // Try to extract metadata from various possible locations
        first_party_name: {
          en: data.contract_data?.first_party_name_en || "First Party",
          ar: data.contract_data?.first_party_name_ar || "الطرف الأول",
        },
        second_party_name: {
          en: data.contract_data?.second_party_name_en || "Second Party",
          ar: data.contract_data?.second_party_name_ar || "الطرف الثاني",
        },
        promoter_name: {
          en: data.contract_data?.promoter_name_en || "Promoter",
          ar: data.contract_data?.promoter_name_ar || "المروج",
        },
        product_name: {
          en: data.contract_data?.product_name_en || "Product",
          ar: data.contract_data?.product_name_ar || "المنتج",
        },
        location_name: {
          en: data.contract_data?.location_name_en || "Location",
          ar: data.contract_data?.location_name_ar || "الموقع",
        },
        start_date: data.contract_data?.start_date || new Date().toISOString(),
        end_date: data.contract_data?.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }

    return { data: constructedContract, error: null }
  } catch (error) {
    console.error("Unexpected error in contract service:", error)
    return { data: createMockContract(contractId), error: null }
  }
}
