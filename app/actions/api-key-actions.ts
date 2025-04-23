"use server"

/**
 * Server action to verify if an API key is valid
 * This keeps the actual API key on the server side
 */
export async function verifyApiKey(keyToVerify: string): Promise<boolean> {
  const validApiKey = process.env.FIGMA_PLUGIN_API_KEY || ""

  // Don't return the actual key, just whether it matches
  return keyToVerify === validApiKey
}

/**
 * Get a masked version of the API key for display purposes
 * This doesn't expose the actual key
 */
export async function getMaskedApiKey(): Promise<string> {
  const apiKey = process.env.FIGMA_PLUGIN_API_KEY || ""

  if (!apiKey) return "API key not configured"

  // Only show first 4 and last 4 characters
  const firstFour = apiKey.substring(0, 4)
  const lastFour = apiKey.substring(apiKey.length - 4)

  return `${firstFour}...${lastFour}`
}
