import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    // Your API logic here
    return Response.json({ message: "Success" })
  } catch (error) {
    return handleApiError(error)
  }
}
