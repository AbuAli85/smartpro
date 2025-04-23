import { v4 as uuidv4 } from "uuid"
import { contractTemplates, fillContractTemplate, generateReferenceNumber } from "./contract-templates"

interface ContractData {
  first_party_name_en: string
  first_party_name_ar?: string
  first_party_cr: string
  second_party_name_en: string
  second_party_name_ar?: string
  second_party_cr: string
  promoter_name_en: string
  promoter_name_ar?: string
  promoter_id: string
  product_name_en: string
  product_name_ar?: string
  location_name_en: string
  location_name_ar?: string
  start_date: string
  end_date: string
  id_photo_url: string
  passport_photo_url: string
  letterhead_image_url: string
  template_type?: string
  [key: string]: any
}

export function generateContractLayout(contractData: ContractData) {
  // Check if a specific template type is requested
  const templateType = contractData.template_type || "promoterAssignment"

  // If using the new template format
  if (templateType === "promoterAssignment") {
    // Fill the template with the contract data
    const filledTemplate = fillContractTemplate(contractTemplates.promoterAssignment, contractData)

    // Return the filled template with additional metadata
    return {
      version: "2.0",
      id: uuidv4(),
      ref_number: filledTemplate.ref_number || generateReferenceNumber(),
      created_at: new Date().toISOString(),
      template_type: templateType,
      contract_template: filledTemplate,
      metadata: {
        first_party_name: {
          en: contractData.first_party_name_en,
          ar: contractData.first_party_name_ar || contractData.first_party_name_en,
        },
        second_party_name: {
          en: contractData.second_party_name_en,
          ar: contractData.second_party_name_ar || contractData.second_party_name_en,
        },
        promoter_name: {
          en: contractData.promoter_name_en,
          ar: contractData.promoter_name_ar || contractData.promoter_name_en,
        },
        product_name: {
          en: contractData.product_name_en,
          ar: contractData.product_name_ar || contractData.product_name_en,
        },
        location_name: {
          en: contractData.location_name_en,
          ar: contractData.location_name_ar || contractData.location_name_en,
        },
        start_date: contractData.start_date,
        end_date: contractData.end_date,
      },
      contract_data: contractData,
    }
  }

  // For backward compatibility, keep the original format
  // Generate a unique ID for the contract
  const contractId = uuidv4()

  // Format dates for display
  const startDate = new Date(contractData.start_date)
  const endDate = new Date(contractData.end_date)

  // Calculate contract duration in days
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Set default Arabic values if not provided
  const first_party_name_ar = contractData.first_party_name_ar || contractData.first_party_name_en
  const second_party_name_ar = contractData.second_party_name_ar || contractData.second_party_name_en
  const promoter_name_ar = contractData.promoter_name_ar || contractData.promoter_name_en
  const product_name_ar = contractData.product_name_ar || contractData.product_name_en
  const location_name_ar = contractData.location_name_ar || contractData.location_name_en

  // Generate contract layout in the original format
  return {
    version: "1.0",
    id: contractId,
    created_at: new Date().toISOString(),
    pages: [
      {
        letterhead_url: contractData.letterhead_image_url,
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
              en: `Contract No. ${contractId}`,
              ar: `رقم العقد ${contractId}`,
            },
          },
          {
            type: "text",
            content: {
              en: `This Promotion Agreement (the "Agreement") is entered into on ${startDate.toLocaleDateString()} by and between:

1. ${contractData.first_party_name_en}, a company registered under the laws with Commercial Registration No. ${contractData.first_party_cr} (hereinafter referred to as the "First Party"), and

2. ${contractData.second_party_name_en}, a company registered under the laws with Commercial Registration No. ${contractData.second_party_cr} (hereinafter referred to as the "Second Party").

The First Party and Second Party shall collectively be referred to as the "Parties" and individually as a "Party".`,
              ar: `تم إبرام اتفاقية الترويج هذه ("الاتفاقية") في ${startDate.toLocaleDateString()} بين:

١. ${first_party_name_ar}، شركة مسجلة بموجب القوانين برقم السجل التجاري ${contractData.first_party_cr} (يشار إليها فيما يلي باسم "الطرف الأول")، و

٢. ${second_party_name_ar}، شركة مسجلة بموجب القوانين برقم السجل التجاري ${contractData.second_party_cr} (يشار إليها فيما يلي باسم "الطرف الثاني").

يشار إلى الطرف الأول والطرف الثاني مجتمعين باسم "الأطراف" وبشكل فردي باسم "الطرف".`,
            },
          },
          {
            type: "title",
            content: {
              en: "WHEREAS",
              ar: "حيث أن",
            },
          },
          {
            type: "text",
            content: {
              en: `A. The First Party is engaged in the business of marketing and promotion.

B. The Second Party wishes to engage the First Party to promote its product "${contractData.product_name_en}" at the location "${contractData.location_name_en}".

C. The Parties wish to set out the terms and conditions of their agreement in writing.`,
              ar: `أ. يعمل الطرف الأول في مجال التسويق والترويج.

ب. يرغب الطرف الثاني في تكليف الطرف الأول بالترويج لمنتجه "${product_name_ar}" في الموقع "${location_name_ar}".

ج. يرغب الطرفان في تحديد شروط وأحكام اتفاقهما كتابةً.`,
            },
          },
          {
            type: "title",
            content: {
              en: "NOW, THEREFORE, THE PARTIES AGREE AS FOLLOWS",
              ar: "وعليه، اتفق الطرفان على ما يلي",
            },
          },
          {
            type: "text",
            content: {
              en: `1. APPOINTMENT

1.1 The Second Party hereby appoints the First Party to promote the Product at the Location during the Term (as defined below).

1.2 The First Party shall engage the promoter ${contractData.promoter_name_en} with ID number ${contractData.promoter_id} (the "Promoter") to carry out the promotion activities.`,
              ar: `١. التعيين

١.١ يعين الطرف الثاني بموجب هذا الطرف الأول للترويج للمنتج في الموقع خلال المدة (كما هو محدد أدناه).

١.٢ يقوم الطرف الأول بتعيين المروج ${promoter_name_ar} برقم الهوية ${contractData.promoter_id} ("المروج") للقيام بأنشطة الترويج.`,
            },
          },
          {
            type: "text",
            content: {
              en: `2. TERM

2.1 This Agreement shall commence on ${startDate.toLocaleDateString()} and shall continue until ${endDate.toLocaleDateString()} (the "Term"), a total of ${durationDays} days.

2.2 This Agreement may be extended by mutual written agreement of the Parties.`,
              ar: `٢. المدة

٢.١ تبدأ هذه الاتفاقية في ${startDate.toLocaleDateString()} وتستمر حتى ${endDate.toLocaleDateString()} ("المدة")، بإجمالي ${durationDays} يومًا.

٢.٢ يمكن تمديد هذه الاتفاقية بموجب اتفاق كتابي متبادل بين الطرفين.`,
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

Name: ${contractData.promoter_name_en}
ID Number: ${contractData.promoter_id}

The Promoter's identification documents have been verified and copies are attached to this Agreement.`,
              ar: `المروج المعين من قبل الطرف الأول لديه التفاصيل التالية:

الاسم: ${promoter_name_ar}
رقم الهوية: ${contractData.promoter_id}

تم التحقق من وثائق هوية المروج وتم إرفاق نسخ منها بهذه الاتفاقية.`,
            },
          },
          {
            type: "photo_section",
            title: {
              en: "ID Photo",
              ar: "صورة الهوية",
            },
            image_url: contractData.id_photo_url,
          },
          {
            type: "photo_section",
            title: {
              en: "Passport Photo",
              ar: "صورة جواز السفر",
            },
            image_url: contractData.passport_photo_url,
          },
          {
            type: "title",
            content: {
              en: "LOCATION AND PRODUCT",
              ar: "الموقع والمنتج",
            },
          },
          {
            type: "text",
            content: {
              en: `4.1 The promotion activities shall be carried out at ${contractData.location_name_en} (the "Location").

4.2 The product to be promoted is ${contractData.product_name_en} (the "Product").`,
              ar: `٤.١ يتم تنفيذ أنشطة الترويج في ${location_name_ar} ("الموقع").

٤.٢ المنتج المراد الترويج له هو ${product_name_ar} ("المنتج").`,
            },
          },
          {
            type: "note",
            content: {
              en: "This contract is governed by the applicable laws and regulations.",
              ar: "يخضع هذا العقد للقوانين واللوائح المعمول بها.",
            },
          },
          {
            type: "signature",
            parties: [
              {
                name: {
                  en: contractData.first_party_name_en,
                  ar: first_party_name_ar,
                },
                role: {
                  en: "First Party",
                  ar: "الطرف الأول",
                },
              },
              {
                name: {
                  en: contractData.second_party_name_en,
                  ar: second_party_name_ar,
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
        en: contractData.first_party_name_en,
        ar: first_party_name_ar,
      },
      second_party_name: {
        en: contractData.second_party_name_en,
        ar: second_party_name_ar,
      },
      promoter_name: {
        en: contractData.promoter_name_en,
        ar: promoter_name_ar,
      },
      product_name: {
        en: contractData.product_name_en,
        ar: product_name_ar,
      },
      location_name: {
        en: contractData.location_name_en,
        ar: location_name_ar,
      },
      start_date: contractData.start_date,
      end_date: contractData.end_date,
    },
    contract_data: contractData,
  }
}
