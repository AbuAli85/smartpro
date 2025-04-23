"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

// Define types for contract JSON structure
interface ContractContent {
  en: string
  ar: string
}

interface TitleSection {
  type: "title"
  content: ContractContent
}

interface NoteSection {
  type: "note"
  content: ContractContent
}

interface PhotoSection {
  type: "photo_section"
  title: ContractContent
  image_url: string
}

interface TextSection {
  type: "text"
  content: ContractContent
}

interface SignatureSection {
  type: "signature"
  parties: {
    name: ContractContent
    role: ContractContent
  }[]
}

type Section = TitleSection | NoteSection | PhotoSection | TextSection | SignatureSection

interface ContractPage {
  letterhead_url?: string
  sections: Section[]
}

// New template format types
interface ContractSection {
  title: ContractContent
  content: ContractContent
}

interface TemplateContractPage {
  page_number: number
  sections: ContractSection[]
}

interface ContractTemplate {
  ref_number: string
  letterhead_image_url: string
  id_card_photo_url: string
  passport_photo_url: string
  pages: TemplateContractPage[]
}

interface ContractJson {
  id: string
  created_at: string
  version?: string
  ref_number?: string
  pages?: ContractPage[]
  contract_template?: ContractTemplate
  metadata?: {
    first_party_name: ContractContent
    second_party_name: ContractContent
    promoter_name: ContractContent
    product_name: ContractContent
    location_name: ContractContent
    start_date: string
    end_date: string
  }
}

interface ContractRendererProps {
  contractJson: ContractJson
}

export default function ContractRenderer({ contractJson }: ContractRendererProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div>Loading contract...</div>
  }

  // Check if we're using the new template format (version 2.0)
  const isNewTemplateFormat = contractJson.version === "2.0" && contractJson.contract_template

  return (
    <div className="contract-renderer">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .contract-page {
            page-break-after: always;
            height: auto !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
        }
        .contract-page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          margin: 0 auto 20mm;
          background: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .bilingual-text {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }
        .bilingual-text .en {
          flex: 1;
          text-align: left;
        }
        .bilingual-text .ar {
          flex: 1;
          text-align: right;
        }
      `}</style>

      <div className="p-4 w-full">
        {isNewTemplateFormat ? (
          // Render the new template format
          <>
            {contractJson.contract_template?.pages.map((page, pageIndex) => (
              <div key={pageIndex} className="contract-page mb-10">
                {/* Letterhead */}
                {pageIndex === 0 && contractJson.contract_template?.letterhead_image_url && (
                  <div className="relative w-full h-[150px] mb-6">
                    <Image
                      src={contractJson.contract_template.letterhead_image_url || "/placeholder.svg"}
                      alt="Letterhead"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}

                {/* Reference Number */}
                {pageIndex === 0 && contractJson.ref_number && (
                  <div className="text-sm mb-4 p-4 bg-gray-50 border-l-4 border-gray-300">
                    <div className="bilingual-text">
                      <div className="en">Reference: {contractJson.ref_number}</div>
                      <div className="ar" dir="rtl">
                        الرقم المرجعي: {contractJson.ref_number}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sections */}
                {page.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-6">
                    {/* Section Title */}
                    <div className="text-xl font-bold mb-3">
                      <div className="bilingual-text">
                        <div className="en">{section.title.en}</div>
                        <div className="ar" dir="rtl">
                          {section.title.ar}
                        </div>
                      </div>
                    </div>

                    {/* Section Content */}
                    <div className="mb-6">
                      {/* Check if content contains image URL */}
                      {section.content.en.includes("[ID_CARD_PHOTO_URL]") ||
                      section.content.en.includes("[PASSPORT_PHOTO_URL]") ? (
                        <div className="text-center mb-6">
                          <div className="relative w-full h-[300px]">
                            <Image
                              src={
                                section.content.en.includes("[ID_CARD_PHOTO_URL]")
                                  ? contractJson.contract_template?.id_card_photo_url || "/placeholder.svg"
                                  : contractJson.contract_template?.passport_photo_url || "/placeholder.svg"
                              }
                              alt="Document"
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        </div>
                      ) : (
                        // Regular text content
                        <div className="bilingual-text">
                          <div className="en whitespace-pre-line">{section.content.en}</div>
                          <div className="ar whitespace-pre-line" dir="rtl">
                            {section.content.ar}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        ) : (
          // Render the original format
          <>
            {contractJson.pages?.map((page, i) => (
              <div key={i} className="contract-page mb-10">
                {page.letterhead_url && (
                  <div className="relative w-full h-[150px] mb-6">
                    <Image
                      src={page.letterhead_url || "/placeholder.svg"}
                      alt="Letterhead"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}

                {page.sections.map((section, idx) => {
                  if (section.type === "title") {
                    return (
                      <div key={idx} className="text-xl font-bold text-center mb-6">
                        <div className="bilingual-text">
                          <div className="en">{section.content.en}</div>
                          <div className="ar" dir="rtl">
                            {section.content.ar}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (section.type === "note") {
                    return (
                      <div key={idx} className="text-sm mb-4 p-4 bg-gray-50 border-l-4 border-gray-300">
                        <div className="bilingual-text">
                          <div className="en">{section.content.en}</div>
                          <div className="ar" dir="rtl">
                            {section.content.ar}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (section.type === "photo_section") {
                    return (
                      <div key={idx} className="text-center mb-6">
                        <div className="font-medium mb-2 bilingual-text">
                          <div className="en">{section.title.en}</div>
                          <div className="ar" dir="rtl">
                            {section.title.ar}
                          </div>
                        </div>
                        <div className="relative w-full h-[300px]">
                          <Image
                            src={section.image_url || "/placeholder.svg"}
                            alt="Document"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    )
                  }

                  if (section.type === "text") {
                    // Split text by newlines to handle paragraphs
                    const enParagraphs = section.content.en.split("\n").filter(Boolean)
                    const arParagraphs = section.content.ar.split("\n").filter(Boolean)

                    // Ensure both arrays have the same length
                    const maxLength = Math.max(enParagraphs.length, arParagraphs.length)
                    for (let i = enParagraphs.length; i < maxLength; i++) enParagraphs.push("")
                    for (let i = arParagraphs.length; i < maxLength; i++) arParagraphs.push("")

                    return (
                      <div key={idx} className="mb-6">
                        {enParagraphs.map((enPara, paraIdx) => (
                          <div key={paraIdx} className="mb-2 bilingual-text">
                            <div className="en">{enPara}</div>
                            <div className="ar" dir="rtl">
                              {arParagraphs[paraIdx]}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }

                  if (section.type === "signature") {
                    return (
                      <div key={idx} className="mt-12 mb-6">
                        <h3 className="font-semibold mb-4 text-center bilingual-text">
                          <div className="en">Signatures</div>
                          <div className="ar" dir="rtl">
                            التوقيعات
                          </div>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {section.parties.map((party, partyIdx) => (
                            <div key={partyIdx} className="border-t pt-4">
                              <div className="bilingual-text">
                                <div className="en font-medium">{party.name.en}</div>
                                <div className="ar font-medium" dir="rtl">
                                  {party.name.ar}
                                </div>
                              </div>
                              <div className="bilingual-text text-sm text-gray-500">
                                <div className="en">{party.role.en}</div>
                                <div className="ar" dir="rtl">
                                  {party.role.ar}
                                </div>
                              </div>
                              <div className="h-16 mt-2 border-b border-dashed"></div>
                              <div className="text-sm text-center mt-1 bilingual-text">
                                <div className="en">Signature</div>
                                <div className="ar" dir="rtl">
                                  التوقيع
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Print button - only visible on screen */}
      <div className="mt-8 text-center no-print">
        <button onClick={() => window.print()} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
          Print Contract
        </button>
      </div>
    </div>
  )
}
