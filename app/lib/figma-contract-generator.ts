import { v4 as uuidv4 } from "uuid"

// Define types for our contract data
interface ContractData {
  firstPartyName: string
  firstPartyNameAr: string
  firstPartyAddress: string
  firstPartyAddressAr: string
  secondPartyName: string
  secondPartyNameAr: string
  secondPartyAddress: string
  secondPartyAddressAr: string
  promoterName: string
  promoterNameAr: string
  productName: string
  productNameAr: string
  location: string
  locationAr: string
  startDate: Date
  endDate: Date
  templateId: string
  firstPartySignature?: string
  secondPartySignature?: string
  [key: string]: any
}

// Define types for Figma-friendly JSON
interface FigmaText {
  type: "TEXT"
  characters: string
  style: {
    fontFamily: string
    fontSize: number
    fontWeight: number
    textAlignHorizontal: string
    textAlignVertical: string
    fills: Array<{
      type: "SOLID"
      color: {
        r: number
        g: number
        b: number
      }
    }>
  }
}

interface FigmaImage {
  type: "IMAGE"
  imageHash: string // This will be replaced by Figma with the actual image hash
  imageUrl: string
}

interface FigmaRectangle {
  type: "RECTANGLE"
  fills: Array<{
    type: "SOLID"
    color: {
      r: number
      g: number
      b: number
    }
  }>
  cornerRadius: number
}

interface FigmaFrame {
  type: "FRAME"
  children: Array<FigmaText | FigmaImage | FigmaRectangle | FigmaFrame>
  layoutMode: "VERTICAL" | "HORIZONTAL" | "NONE"
  primaryAxisAlignItems: "CENTER" | "SPACE_BETWEEN" | "MIN" | "MAX"
  counterAxisAlignItems: "CENTER" | "MIN" | "MAX"
  paddingLeft: number
  paddingRight: number
  paddingTop: number
  paddingBottom: number
  itemSpacing: number
  width: number
  height: number
  fills?: Array<{
    type: "SOLID"
    color: {
      r: number
      g: number
      b: number
    }
  }>
}

interface FigmaPage {
  type: "PAGE"
  children: FigmaFrame[]
}

interface FigmaDocument {
  type: "DOCUMENT"
  children: FigmaPage[]
}

// Main function to generate Figma-friendly JSON
export function generateFigmaContractJSON(contractData: ContractData): any {
  // Format dates
  const startDate = contractData.startDate instanceof Date ? contractData.startDate : new Date(contractData.startDate)

  const endDate = contractData.endDate instanceof Date ? contractData.endDate : new Date(contractData.endDate)

  const formattedStartDate = startDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedEndDate = endDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Calculate contract duration in days
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Generate a unique reference number
  const refNumber = `CONT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

  // Create the Figma document structure
  const document: FigmaDocument = {
    type: "DOCUMENT",
    children: [
      {
        type: "PAGE",
        children: [
          // Page 1 - Contract Header and Introduction
          createContractPage(1, {
            refNumber,
            title: {
              en: "PROMOTION AGREEMENT",
              ar: "اتفاقية ترويج",
            },
            sections: [
              {
                type: "introduction",
                content: {
                  en: `This Promotion Agreement (the "Agreement") is entered into on ${formattedStartDate} by and between:

1. ${contractData.firstPartyName}, (hereinafter referred to as the "First Party"), and

2. ${contractData.secondPartyName}, (hereinafter referred to as the "Second Party").

The First Party and Second Party shall collectively be referred to as the "Parties" and individually as a "Party".`,
                  ar: `تم إبرام اتفاقية الترويج هذه ("الاتفاقية") في ${formattedStartDate} بين:

١. ${contractData.firstPartyNameAr}، (يشار إليها فيما يلي باسم "الطرف الأول")، و

٢. ${contractData.secondPartyNameAr}، (يشار إليها فيما يلي باسم "الطرف الثاني").

يشار إلى الطرف الأول والطرف الثاني مجتمعين باسم "الأطراف" وبشكل فردي باسم "الطرف".`,
                },
              },
              {
                type: "section",
                title: {
                  en: "WHEREAS",
                  ar: "حيث أن",
                },
                content: {
                  en: `A. The First Party is engaged in the business of marketing and promotion.

B. The Second Party wishes to engage the First Party to promote its product "${contractData.productName}" at the location "${contractData.location}".

C. The Parties wish to set out the terms and conditions of their agreement in writing.`,
                  ar: `أ. يعمل الطرف الأول في مجال التسويق والترويج.

ب. يرغب الطرف الثاني في تكليف الطرف الأول بالترويج لمنتجه "${contractData.productNameAr}" في الموقع "${contractData.locationAr}".

ج. يرغب الطرفان في تحديد شروط وأحكام اتفاقهما كتابةً.`,
                },
              },
            ],
          }),

          // Page 2 - Promoter Details and Terms
          createContractPage(2, {
            refNumber,
            title: {
              en: "PROMOTER DETAILS",
              ar: "تفاصيل المروج",
            },
            sections: [
              {
                type: "section",
                content: {
                  en: `The Promoter engaged by the First Party has the following details:

Name: ${contractData.promoterName}

The Promoter's identification documents have been verified and copies are attached to this Agreement.`,
                  ar: `المروج المعين من قبل الطرف الأول لديه التفاصيل التالية:

الاسم: ${contractData.promoterNameAr}

تم التحقق من وثائق هوية المروج وتم إرفاق نسخ منها بهذه الاتفاقية.`,
                },
              },
              {
                type: "section",
                title: {
                  en: "TERM",
                  ar: "المدة",
                },
                content: {
                  en: `This Agreement shall commence on ${formattedStartDate} and shall continue until ${formattedEndDate} (the "Term"), a total of ${durationDays} days.

This Agreement may be extended by mutual written agreement of the Parties.`,
                  ar: `تبدأ هذه الاتفاقية في ${formattedStartDate} وتستمر حتى ${formattedEndDate} ("المدة")، بإجمالي ${durationDays} يومًا.

يمكن تمديد هذه الاتفاقية بموجب اتفاق كتابي متبادل بين الطرفين.`,
                },
              },
            ],
          }),

          // Page 3 - Signatures
          createContractPage(3, {
            refNumber,
            title: {
              en: "SIGNATURES",
              ar: "التوقيعات",
            },
            sections: [
              {
                type: "signatures",
                parties: [
                  {
                    name: {
                      en: contractData.firstPartyName,
                      ar: contractData.firstPartyNameAr,
                    },
                    role: {
                      en: "First Party",
                      ar: "الطرف الأول",
                    },
                    signature: contractData.firstPartySignature,
                  },
                  {
                    name: {
                      en: contractData.secondPartyName,
                      ar: contractData.secondPartyNameAr,
                    },
                    role: {
                      en: "Second Party",
                      ar: "الطرف الثاني",
                    },
                    signature: contractData.secondPartySignature,
                  },
                ],
              },
            ],
          }),
        ],
      },
    ],
  }

  // Add metadata for Figma plugin
  const figmaFriendlyJSON = {
    id: uuidv4(),
    version: "1.0",
    type: "contract",
    metadata: {
      title: "Promotion Agreement",
      titleAr: "اتفاقية ترويج",
      refNumber,
      firstParty: {
        name: contractData.firstPartyName,
        nameAr: contractData.firstPartyNameAr,
        address: contractData.firstPartyAddress,
        addressAr: contractData.firstPartyAddressAr,
      },
      secondParty: {
        name: contractData.secondPartyName,
        nameAr: contractData.secondPartyNameAr,
        address: contractData.secondPartyAddress,
        addressAr: contractData.secondPartyAddressAr,
      },
      promoter: {
        name: contractData.promoterName,
        nameAr: contractData.promoterNameAr,
      },
      product: {
        name: contractData.productName,
        nameAr: contractData.productNameAr,
      },
      location: {
        name: contractData.location,
        nameAr: contractData.locationAr,
      },
      dates: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        durationDays,
      },
    },
    figmaDocument: document,
  }

  return figmaFriendlyJSON
}

// Helper function to create a contract page
function createContractPage(pageNumber: number, pageData: any): FigmaFrame {
  // Create a page frame
  const pageFrame: FigmaFrame = {
    type: "FRAME",
    children: [],
    layoutMode: "VERTICAL",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "CENTER",
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 40,
    paddingBottom: 40,
    itemSpacing: 24,
    width: 595, // A4 width in points
    height: 842, // A4 height in points
    fills: [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ],
  }

  // Add header with reference number
  pageFrame.children.push(createHeader(pageData.refNumber, pageNumber))

  // Add title
  if (pageData.title) {
    pageFrame.children.push(createBilingualTitle(pageData.title.en, pageData.title.ar))
  }

  // Add sections
  if (pageData.sections) {
    pageData.sections.forEach((section: any) => {
      if (section.type === "introduction" || section.type === "section") {
        // Add section title if it exists
        if (section.title) {
          pageFrame.children.push(createBilingualSubtitle(section.title.en, section.title.ar))
        }

        // Add section content
        pageFrame.children.push(createBilingualText(section.content.en, section.content.ar))
      } else if (section.type === "signatures") {
        pageFrame.children.push(createSignatureSection(section.parties))
      }
    })
  }

  return pageFrame
}

// Helper function to create a header
function createHeader(refNumber: string, pageNumber: number): FigmaFrame {
  return {
    type: "FRAME",
    children: [
      {
        type: "TEXT",
        characters: `Ref: ${refNumber} | Page ${pageNumber}`,
        style: {
          fontFamily: "Arial",
          fontSize: 10,
          fontWeight: 400,
          textAlignHorizontal: "RIGHT",
          textAlignVertical: "CENTER",
          fills: [
            {
              type: "SOLID",
              color: {
                r: 0.4,
                g: 0.4,
                b: 0.4,
              },
            },
          ],
        },
      },
    ],
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "SPACE_BETWEEN",
    counterAxisAlignItems: "CENTER",
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 16,
    itemSpacing: 0,
    width: 515, // Full width minus padding
    height: 24,
  }
}

// Helper function to create a bilingual title
function createBilingualTitle(enText: string, arText: string): FigmaFrame {
  return {
    type: "FRAME",
    children: [
      {
        type: "TEXT",
        characters: enText,
        style: {
          fontFamily: "Arial",
          fontSize: 18,
          fontWeight: 700,
          textAlignHorizontal: "LEFT",
          textAlignVertical: "CENTER",
          fills: [
            {
              type: "SOLID",
              color: {
                r: 0,
                g: 0,
                b: 0,
              },
            },
          ],
        },
      },
      {
        type: "TEXT",
        characters: arText,
        style: {
          fontFamily: "Arial",
          fontSize: 18,
          fontWeight: 700,
          textAlignHorizontal: "RIGHT",
          textAlignVertical: "CENTER",
          fills: [
            {
              type: "SOLID",
              color: {
                r: 0,
                g: 0,
                b: 0,
              },
            },
          ],
        },
      },
    ],
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "SPACE_BETWEEN",
    counterAxisAlignItems: "CENTER",
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    itemSpacing: 16,
    width: 515, // Full width minus padding
    height: 40,
  }
}

// Helper function to create a bilingual subtitle
function createBilingualSubtitle(enText: string, arText: string): FigmaFrame {
  return {
    type: "FRAME",
    children: [
      {
        type: "TEXT",
        characters: enText,
        style: {
          fontFamily: "Arial",
          fontSize: 16,
          fontWeight: 700,
          textAlignHorizontal: "LEFT",
          textAlignVertical: "CENTER",
          fills: [
            {
              type: "SOLID",
              color: {
                r: 0,
                g: 0,
                b: 0,
              },
            },
          ],
        },
      },
      {
        type: "TEXT",
        characters: arText,
        style: {
          fontFamily: "Arial",
          fontSize: 16,
          fontWeight: 700,
          textAlignHorizontal: "RIGHT",
          textAlignVertical: "CENTER",
          fills: [
            {
              type: "SOLID",
              color: {
                r: 0,
                g: 0,
                b: 0,
              },
            },
          ],
        },
      },
    ],
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "SPACE_BETWEEN",
    counterAxisAlignItems: "CENTER",
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 16,
    paddingBottom: 8,
    itemSpacing: 16,
    width: 515, // Full width minus padding
    height: 32,
  }
}

// Helper function to create bilingual text
function createBilingualText(enText: string, arText: string): FigmaFrame {
  return {
    type: "FRAME",
    children: [
      {
        type: "TEXT",
        characters: enText,
        style: {
          fontFamily: "Arial",
          fontSize: 12,
          fontWeight: 400,
          textAlignHorizontal: "LEFT",
          textAlignVertical: "TOP",
          fills: [
            {
              type: "SOLID",
              color: {
                r: 0,
                g: 0,
                b: 0,
              },
            },
          ],
        },
      },
      {
        type: "TEXT",
        characters: arText,
        style: {
          fontFamily: "Arial",
          fontSize: 12,
          fontWeight: 400,
          textAlignHorizontal: "RIGHT",
          textAlignVertical: "TOP",
          fills: [
            {
              type: "SOLID",
              color: {
                r: 0,
                g: 0,
                b: 0,
              },
            },
          ],
        },
      },
    ],
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "SPACE_BETWEEN",
    counterAxisAlignItems: "MIN",
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    itemSpacing: 16,
    width: 515, // Full width minus padding
    height: 0, // Auto height
  }
}

// Helper function to create a signature section
function createSignatureSection(parties: any[]): FigmaFrame {
  const signatureFrame: FigmaFrame = {
    type: "FRAME",
    children: [],
    layoutMode: "HORIZONTAL",
    primaryAxisAlignItems: "SPACE_BETWEEN",
    counterAxisAlignItems: "TOP",
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 32,
    paddingBottom: 0,
    itemSpacing: 24,
    width: 515, // Full width minus padding
    height: 200,
  }

  // Add signature blocks for each party
  parties.forEach((party) => {
    signatureFrame.children.push(createSignatureBlock(party))
  })

  return signatureFrame
}

// Helper function to create a signature block
function createSignatureBlock(party: any): FigmaFrame {
  return {
    type: "FRAME",
    children: [
      // Party name
      {
        type: "FRAME",
        children: [
          {
            type: "TEXT",
            characters: party.name.en,
            style: {
              fontFamily: "Arial",
              fontSize: 14,
              fontWeight: 700,
              textAlignHorizontal: "LEFT",
              textAlignVertical: "CENTER",
              fills: [
                {
                  type: "SOLID",
                  color: {
                    r: 0,
                    g: 0,
                    b: 0,
                  },
                },
              ],
            },
          },
          {
            type: "TEXT",
            characters: party.name.ar,
            style: {
              fontFamily: "Arial",
              fontSize: 14,
              fontWeight: 700,
              textAlignHorizontal: "RIGHT",
              textAlignVertical: "CENTER",
              fills: [
                {
                  type: "SOLID",
                  color: {
                    r: 0,
                    g: 0,
                    b: 0,
                  },
                },
              ],
            },
          },
        ],
        layoutMode: "HORIZONTAL",
        primaryAxisAlignItems: "SPACE_BETWEEN",
        counterAxisAlignItems: "CENTER",
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 8,
        itemSpacing: 8,
        width: 240,
        height: 24,
      },

      // Party role
      {
        type: "FRAME",
        children: [
          {
            type: "TEXT",
            characters: party.role.en,
            style: {
              fontFamily: "Arial",
              fontSize: 12,
              fontWeight: 400,
              textAlignHorizontal: "LEFT",
              textAlignVertical: "CENTER",
              fills: [
                {
                  type: "SOLID",
                  color: {
                    r: 0.4,
                    g: 0.4,
                    b: 0.4,
                  },
                },
              ],
            },
          },
          {
            type: "TEXT",
            characters: party.role.ar,
            style: {
              fontFamily: "Arial",
              fontSize: 12,
              fontWeight: 400,
              textAlignHorizontal: "RIGHT",
              textAlignVertical: "CENTER",
              fills: [
                {
                  type: "SOLID",
                  color: {
                    r: 0.4,
                    g: 0.4,
                    b: 0.4,
                  },
                },
              ],
            },
          },
        ],
        layoutMode: "HORIZONTAL",
        primaryAxisAlignItems: "SPACE_BETWEEN",
        counterAxisAlignItems: "CENTER",
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 16,
        itemSpacing: 8,
        width: 240,
        height: 20,
      },

      // Signature box
      {
        type: "RECTANGLE",
        fills: [
          {
            type: "SOLID",
            color: {
              r: 0.95,
              g: 0.95,
              b: 0.95,
            },
          },
        ],
        cornerRadius: 4,
      },

      // Signature label
      {
        type: "FRAME",
        children: [
          {
            type: "TEXT",
            characters: "Signature",
            style: {
              fontFamily: "Arial",
              fontSize: 10,
              fontWeight: 400,
              textAlignHorizontal: "LEFT",
              textAlignVertical: "CENTER",
              fills: [
                {
                  type: "SOLID",
                  color: {
                    r: 0.4,
                    g: 0.4,
                    b: 0.4,
                  },
                },
              ],
            },
          },
          {
            type: "TEXT",
            characters: "التوقيع",
            style: {
              fontFamily: "Arial",
              fontSize: 10,
              fontWeight: 400,
              textAlignHorizontal: "RIGHT",
              textAlignVertical: "CENTER",
              fills: [
                {
                  type: "SOLID",
                  color: {
                    r: 0.4,
                    g: 0.4,
                    b: 0.4,
                  },
                },
              ],
            },
          },
        ],
        layoutMode: "HORIZONTAL",
        primaryAxisAlignItems: "SPACE_BETWEEN",
        counterAxisAlignItems: "CENTER",
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 4,
        paddingBottom: 0,
        itemSpacing: 8,
        width: 240,
        height: 16,
      },
    ],
    layoutMode: "VERTICAL",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "MIN",
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    itemSpacing: 0,
    width: 240,
    height: 200,
  }
}
