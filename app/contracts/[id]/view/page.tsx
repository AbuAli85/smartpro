import { getContractLayout } from "@/app/lib/contract-service"
import ContractRenderer from "@/app/components/contract-renderer"
import { notFound } from "next/navigation"

export default async function ContractViewPage({
  params,
}: {
  params: { id: string }
}) {
  // Fetch contract layout
  const { data, error } = await getContractLayout(params.id)

  if (error || !data) {
    notFound()
  }

  // Transform the data to match the expected format if needed
  const contractJson = data.pages
    ? data
    : {
        id: data.id || params.id,
        created_at: data.created_at || new Date().toISOString(),
        pages: [
          {
            letterhead_url: data.layout?.header?.logo || data.contract_data?.letterhead_image_url,
            sections: data.layout?.sections?.map(transformSection) || [],
          },
        ],
      }

  return (
    <div className="py-8">
      <ContractRenderer contractJson={contractJson} />
    </div>
  )
}

// Helper function to transform old section format to new format
function transformSection(section: any) {
  switch (section.type) {
    case "header":
      return {
        type: "title",
        content: {
          en: section.title || "",
          ar: section.title_ar || section.title || "",
        },
      }
    case "text":
      return {
        type: "text",
        content: {
          en: section.content || "",
          ar: section.content_ar || section.content || "",
        },
      }
    case "note":
      return {
        type: "note",
        content: {
          en: section.content || "",
          ar: section.content_ar || section.content || "",
        },
      }
    case "promoter":
      return {
        type: "photo_section",
        title: {
          en: "Promoter ID",
          ar: "هوية المروج",
        },
        image_url: section.id_photo || "",
      }
    case "signature":
      return {
        type: "signature",
        parties: [
          {
            name: {
              en: section.first_party?.name || "",
              ar: section.first_party?.name_ar || section.first_party?.name || "",
            },
            role: {
              en: "First Party",
              ar: "الطرف الأول",
            },
          },
          {
            name: {
              en: section.second_party?.name || "",
              ar: section.second_party?.name_ar || section.second_party?.name || "",
            },
            role: {
              en: "Second Party",
              ar: "الطرف الثاني",
            },
          },
        ],
      }
    default:
      return section
  }
}
