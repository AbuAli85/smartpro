import jsPDF from "jspdf"
import { format } from "date-fns"
import { getTranslations } from "./translations"

// Define contract data type
interface ContractData {
  contractType: string
  firstPartyName: string
  secondPartyName: string
  startDate: string
  endDate: string
  responsibilities: string
  signature: string
  stamp?: string
  referenceNumber: string
}

/**
 * Generates a PDF contract document based on the provided data and language
 * @param data Contract data to include in the PDF
 * @param language Language for the PDF (en or ar)
 * @returns The generated PDF document as a Blob
 */
export async function generateContractPDF(data: ContractData, language: "en" | "ar"): Promise<Blob> {
  // Get translations
  const t = getTranslations(language)

  // Create new PDF document
  // Use A4 size and set orientation based on language (portrait for both, but we'll handle RTL differently)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set RTL mode for Arabic
  if (language === "ar") {
    pdf.setR2L(true) // Set right-to-left for Arabic
  } else {
    pdf.setR2L(false)
  }

  // Define page dimensions
  const pageWidth = pdf.internal.pageSize.width
  const pageHeight = pdf.internal.pageSize.height
  const margin = 20 // margin in mm
  const contentWidth = pageWidth - margin * 2

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (e) {
      return dateString
    }
  }

  // Add header with logo and reference number
  pdf.setFillColor(245, 245, 245) // Light gray background
  pdf.rect(0, 0, pageWidth, 40, "F")

  // Add company logo (placeholder)
  // In a real implementation, you would load and add your company logo
  pdf.setFontSize(22)
  pdf.setFont("helvetica", "bold")
  pdf.text("CONTRACT", language === "ar" ? pageWidth - margin : margin, 15)

  // Add reference number
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  const refText = `${t.referenceNumber}: ${data.referenceNumber}`
  pdf.text(refText, language === "ar" ? pageWidth - margin : margin, 25)

  // Add contract title
  pdf.setFontSize(18)
  pdf.setFont("helvetica", "bold")

  // Get contract type translation
  const contractTypeText =
    t.contractTypeOptions[data.contractType.toLowerCase() as keyof typeof t.contractTypeOptions] || data.contractType
  const titleText = `${contractTypeText} ${t.formTitle}`

  pdf.text(titleText, language === "ar" ? pageWidth - margin : margin, 50)

  // Add parties section
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text(t.parties, language === "ar" ? pageWidth - margin : margin, 65)

  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")

  // First party
  pdf.text(`${t.firstPartyName}:`, language === "ar" ? pageWidth - margin : margin, 75)
  pdf.setFont("helvetica", "bold")
  pdf.text(data.firstPartyName, language === "ar" ? pageWidth - margin - 40 : margin + 40, 75)

  // Second party
  pdf.setFont("helvetica", "normal")
  pdf.text(`${t.secondPartyName}:`, language === "ar" ? pageWidth - margin : margin, 85)
  pdf.setFont("helvetica", "bold")
  pdf.text(data.secondPartyName, language === "ar" ? pageWidth - margin - 40 : margin + 40, 85)

  // Add duration section
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text(t.duration, language === "ar" ? pageWidth - margin : margin, 100)

  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  const durationText = `${formatDate(data.startDate)} ${t.to} ${formatDate(data.endDate)}`
  pdf.text(durationText, language === "ar" ? pageWidth - margin : margin, 110)

  // Add responsibilities section
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text(t.responsibilities, language === "ar" ? pageWidth - margin : margin, 125)

  // Split responsibilities text into lines to fit the page width
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")

  const textLines = pdf.splitTextToSize(data.responsibilities, contentWidth)
  pdf.text(textLines, language === "ar" ? pageWidth - margin : margin, 135)

  // Calculate the Y position after the responsibilities text
  const responsibilitiesEndY = 135 + textLines.length * 7

  // Add signature and stamp section
  const signatureY = responsibilitiesEndY + 20

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.text(t.signature, language === "ar" ? pageWidth - margin : margin, signatureY)

  // Add signature image if available
  if (data.signature) {
    try {
      // Add signature image
      pdf.addImage(data.signature, "PNG", language === "ar" ? pageWidth - margin - 60 : margin, signatureY + 5, 60, 30)
    } catch (error) {
      console.error("Error adding signature to PDF:", error)
    }
  }

  // Add stamp image if available
  if (data.stamp) {
    try {
      const stampY = signatureY + 40
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(t.stamp.replace(" (Optional)", ""), language === "ar" ? pageWidth - margin : margin, stampY)

      // Add stamp image
      pdf.addImage(data.stamp, "PNG", language === "ar" ? pageWidth - margin - 60 : margin, stampY + 5, 60, 30)
    } catch (error) {
      console.error("Error adding stamp to PDF:", error)
    }
  }

  // Add footer with date and page number
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")

  const today = format(new Date(), "PPP")
  pdf.text(today, language === "ar" ? pageWidth - margin : margin, pageHeight - 10)

  const pageText = `${language === "ar" ? "1 صفحة" : "Page 1"}`
  pdf.text(pageText, language === "ar" ? margin : pageWidth - margin - 20, pageHeight - 10)

  // Return the PDF as a blob
  return pdf.output("blob")
}

/**
 * Downloads the generated PDF with a specified filename
 * @param blob PDF blob to download
 * @param filename Name for the downloaded file
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
