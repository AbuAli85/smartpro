import type { NextRequest } from "next/server"
import { z } from "zod"
import {
  validateAuth,
  validateRequest,
  createErrorResponse,
  createSuccessResponse,
  addCorsHeaders,
  hasRequiredRole,
} from "@/app/lib/edge-function-validation"
import { UserRole } from "@/types/auth"

// Define the validation schema
const importMergePreviewSchema = z.object({
  fileType: z.enum(["json", "csv"], {
    errorMap: () => ({ message: "File type must be either 'json' or 'csv'" }),
  }),
  fileContent: z.string().min(1, "File content is required"),
  options: z.record(z.string(), z.any()).optional(),
})

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const { error: authError, status: authStatus, user } = await validateAuth(request)

    if (authError) {
      return createErrorResponse(authError, authStatus)
    }

    // Check if user has required role
    if (!hasRequiredRole(user?.role, [UserRole.ADMIN, UserRole.COMPANY])) {
      return createErrorResponse("Forbidden: Insufficient permissions", 403)
    }

    // Parse and validate request body
    const body = await request.json()
    const { data, error: validationError } = validateRequest(body, importMergePreviewSchema)

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Process the file based on its type
    let parsedData: any[] = []
    const duplicates: any[] = []
    const errors: string[] = []

    try {
      if (data!.fileType === "json") {
        // Parse JSON file
        parsedData = JSON.parse(data!.fileContent)

        // Validate that it's an array
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData]
        }
      } else if (data!.fileType === "csv") {
        // Parse CSV file (simplified implementation)
        const lines = data!.fileContent.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim())

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue

          const values = lines[i].split(",").map((v) => v.trim())
          const row: Record<string, string> = {}

          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })

          parsedData.push(row)
        }
      }

      // Check for duplicates (simplified implementation)
      // In a real implementation, you would check against the database
      const uniqueKeys = new Set()
      parsedData.forEach((item) => {
        const key = item.id || item.email || JSON.stringify(item)
        if (uniqueKeys.has(key)) {
          duplicates.push(item)
        } else {
          uniqueKeys.add(key)
        }
      })
    } catch (error) {
      console.error("Error parsing file:", error)
      errors.push(`Error parsing file: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Return the preview results
    const response = createSuccessResponse({
      preview: parsedData.slice(0, 10), // First 10 items for preview
      totalItems: parsedData.length,
      duplicates,
      errors,
    })

    return addCorsHeaders(response)
  } catch (error) {
    console.error("Unexpected error:", error)
    return createErrorResponse("An unexpected error occurred", 500)
  }
}
