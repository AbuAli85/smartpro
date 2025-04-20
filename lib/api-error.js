export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
  }
}

export const handleApiError = (error) => {
  console.error("API Error:", error)

  // Determine status code and message
  if (error instanceof ApiError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Default error response
  return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  })
}
