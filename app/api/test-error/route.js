export async function GET() {
  try {
    // Simulate an API error 50% of the time
    if (Math.random() > 0.5) {
      throw new Error("Random API error")
    }

    return Response.json({ success: true, message: "API call successful" })
  } catch (error) {
    // Log the error
    console.error("API error:", error)

    // Return an error response
    return Response.json({ success: false, message: "Something went wrong" }, { status: 500 })
  }
}
