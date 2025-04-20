// Email service using SendGrid
// You'll need to set SENDGRID_API_KEY in your Supabase environment variables

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, from = "noreply@contractmanagement.com" } = options

  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")

  if (!SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY is not set")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(JSON.stringify(errorData))
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: error.message }
  }
}
