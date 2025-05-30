import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient, createSupabaseServerAdminClient } from "@/lib/supabase/server"
import type { Template } from "@/types"

import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import type { Readable } from "stream"

// Helper to convert Node.js stream to Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on("data", (chunk) => chunks.push(chunk))
    stream.on("error", reject)
    stream.on("end", () => resolve(Buffer.concat(chunks)))
  })
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient() // For user context
  const supabaseAdmin = createSupabaseServerAdminClient() // For elevated privileges (storage, specific queries)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { templateId, formData } = (await request.json()) as {
      templateId: string
      formData: Record<string, any>
    }

    if (!templateId || !formData) {
      return NextResponse.json({ error: "Missing templateId or formData" }, { status: 400 })
    }

    // 1. Fetch template details from the database
    const { data: templateData, error: templateError } = await supabaseAdmin
      .from("templates")
      .select("*")
      .eq("id", templateId)
      .single()

    if (templateError || !templateData) {
      console.error("Error fetching template:", templateError)
      return NextResponse.json({ error: "Template not found or error fetching template" }, { status: 404 })
    }

    const currentTemplate = templateData as Template
    const placeholdersConfig = currentTemplate.placeholders_config || []

    // 2. Fetch the .docx template file from Supabase Storage
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from(currentTemplate.docx_file_bucket)
      .download(currentTemplate.docx_file_path)

    if (fileError || !fileData) {
      console.error("Error downloading template file:", fileError)
      return NextResponse.json({ error: "Could not retrieve template file" }, { status: 500 })
    }

    const templateFileBuffer = Buffer.from(await fileData.arrayBuffer())

    // 3. Prepare data for docxtemplater (resolve IDs to display names if necessary)
    const docxData: Record<string, any> = {}
    for (const ph of placeholdersConfig) {
      const formValue = formData[ph.docx_tag]
      if (formValue === undefined || formValue === null) {
        docxData[ph.docx_tag] = "" // Default to empty string if no value provided
        continue
      }

      if (ph.type === "select" && ph.source_table && ph.source_value_column && ph.source_display_column && formValue) {
        // Value from select is an ID, fetch the display name
        const { data: relatedData, error: relatedError } = await supabaseAdmin
          .from(ph.source_table)
          .select(ph.source_display_column)
          .eq(ph.source_value_column, formValue)
          .single()

        if (relatedError || !relatedData) {
          console.warn(`Could not fetch display name for ${ph.docx_tag} with ID ${formValue}: ${relatedError?.message}`)
          docxData[ph.docx_tag] = formValue // Fallback to ID if lookup fails
        } else {
          docxData[ph.docx_tag] = (relatedData as any)[ph.source_display_column]
        }
      } else {
        // For other types or if it's not a select needing lookup, use the value directly
        docxData[ph.docx_tag] = formValue
      }
    }

    // Add a simple date formatter for convenience if you use {{date}} in templates
    // You can expand this with a more robust date formatting utility
    const now = new Date()
    docxData["generation_date_long"] = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    docxData["generation_date_short"] = now.toLocaleDateString("en-US")

    // 4. Use docxtemplater to generate the new document
    const zip = new PizZip(templateFileBuffer)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // To handle nullish values gracefully, you can use a parser
      parser: (tag) => {
        return {
          get(scope, context) {
            if (tag === ".") {
              // docxtemplater internal tag
              return scope
            }
            // If tag is not found in scope, return empty string instead of throwing error
            if (scope[tag] === undefined || scope[tag] === null) {
              return ""
            }
            return scope[tag]
          },
        }
      },
    })

    doc.setData(docxData)

    try {
      doc.render()
    } catch (renderError: any) {
      console.error("Error rendering document:", renderError)
      // Provide more detailed error if possible (e.g., from renderError.properties.errors)
      const errorMessages =
        renderError.properties?.errors
          ?.map((e: any) => `${e.id}: ${e.message} (Tag: ${e.properties?.part?.value})`)
          .join("\n") || renderError.message
      return NextResponse.json({ error: `Failed to render document. ${errorMessages}` }, { status: 500 })
    }

    const generatedDocBuffer = doc.getZip().generate({ type: "nodebuffer" })

    // 5. Upload generated document to Supabase Storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const safeTemplateName = currentTemplate.name.replace(/[^a-zA-Z0-9]/g, "_")
    const generatedFileName = `${user.id.substring(0, 8)}_${safeTemplateName}_${timestamp}.docx`
    const generatedFileBucket = "generated_contracts" // As defined in your schema
    const generatedFilePath = `${user.id}/${generatedFileName}` // Store in a user-specific folder

    const { error: uploadError } = await supabaseAdmin.storage
      .from(generatedFileBucket)
      .upload(generatedFilePath, generatedDocBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true, // Overwrite if somehow a file with the exact same name exists
      })

    if (uploadError) {
      console.error("Error uploading generated document:", uploadError)
      return NextResponse.json({ error: "Failed to store generated document" }, { status: 500 })
    }

    // 6. Insert record into `contracts` table
    const { error: dbInsertError } = await supabase.from("contracts").insert({
      user_id: user.id,
      template_id: currentTemplate.id,
      form_values: formData, // Store the raw form values submitted by user
      generated_file_bucket: generatedFileBucket,
      generated_file_path: generatedFilePath,
      generated_file_name: generatedFileName,
      generated_at: new Date().toISOString(),
    })

    if (dbInsertError) {
      console.error("Error saving contract record:", dbInsertError)
      // Potentially try to delete the uploaded file if DB insert fails to avoid orphaned files
      await supabaseAdmin.storage.from(generatedFileBucket).remove([generatedFilePath])
      return NextResponse.json({ error: "Failed to save contract record" }, { status: 500 })
    }

    // 7. Return success response
    return NextResponse.json(
      {
        message: "Contract generated successfully!",
        fileName: generatedFileName,
        filePath: generatedFilePath,
        bucket: generatedFileBucket,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Unexpected error in /api/generate-contract:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
