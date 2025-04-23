/**
 * Authentication utilities for lovable.dev API
 * Handles token management, authentication headers, and refresh logic
 */

import {
  STORAGE_KEYS,
  AUTH_ENDPOINTS,
  TOKEN_REFRESH,
  type AuthTokens,
  type RefreshResponse,
  type AuthError,
} from "./lovable-auth-config"

/**
 * Store authentication tokens securely
 */
export function storeAuthTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return

  const { accessToken, refreshToken, expiresIn } = tokens
  const expiryTime = Date.now() + expiresIn * 1000

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString())
}

/**
 * Clear stored authentication tokens
 */
export function clearAuthTokens(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY)
  localStorage.removeItem(STORAGE_KEYS.USER_DATA)
}

/**
 * Get the current access token, refreshing if necessary
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const expiryTime = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)

  // If no token exists, return null
  if (!token || !expiryTime) return null

  // Check if token is expired or about to expire
  const isExpiringSoon = Date.now() > Number.parseInt(expiryTime) - TOKEN_REFRESH.REFRESH_BEFORE_EXPIRY_MS

  if (isExpiringSoon) {
    // Try to refresh the token
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    if (!refreshToken) return null

    try {
      const newTokens = await refreshAuthToken(refreshToken)
      if (newTokens) {
        // Update only the access token and expiry, keep the same refresh token
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newTokens.accessToken)
        const newExpiryTime = Date.now() + newTokens.expiresIn * 1000
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, newExpiryTime.toString())
        return newTokens.accessToken
      }
      return null
    } catch (error) {
      console.error("Failed to refresh token:", error)
      clearAuthTokens()
      return null
    }
  }

  return token
}

/**
 * Refresh the authentication token
 */
async function refreshAuthToken(refreshToken: string): Promise<RefreshResponse | null> {
  try {
    const response = await fetch(AUTH_ENDPOINTS.REFRESH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const errorData = (await response.json()) as AuthError
      throw new Error(errorData.message || "Failed to refresh token")
    }

    return (await response.json()) as RefreshResponse
  } catch (error) {
    console.error("Error refreshing token:", error)
    return null
  }
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const expiryTime = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)

  if (!token || !expiryTime) return false

  return Date.now() < Number.parseInt(expiryTime)
}

/**
 * Get authentication headers for API requests
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken()

  if (!token) {
    return {
      "Content-Type": "application/json",
    }
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

/**
 * Login user with email and password
 */
export async function loginWithEmailPassword(email: string, password: string) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = (await response.json()) as AuthError
      throw new Error(errorData.message || "Login failed")
    }

    const data = await response.json()

    // Store tokens and user data
    storeAuthTokens(data.tokens)
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user))

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

/**
 * Logout user
 */
export async function logout() {
  try {
    const token = await getAccessToken()

    if (token) {
      // Call logout endpoint to invalidate token on server
      await fetch(AUTH_ENDPOINTS.LOGOUT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    }
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    // Always clear local tokens regardless of server response
    clearAuthTokens()
  }
}

/**
 * Get current user data
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null

  const userDataString = localStorage.getItem(STORAGE_KEYS.USER_DATA)
  if (!userDataString) return null

  try {
    return JSON.parse(userDataString)
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}
