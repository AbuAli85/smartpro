/**
 * Authentication configuration for lovable.dev API
 * Contains constants and types for authentication
 */

// API Base URL
export const LOVABLE_API_BASE_URL = process.env.NEXT_PUBLIC_LOVABLE_API_URL || "https://api.lovable.dev"

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${LOVABLE_API_BASE_URL}/auth/login`,
  REFRESH: `${LOVABLE_API_BASE_URL}/auth/refresh`,
  LOGOUT: `${LOVABLE_API_BASE_URL}/auth/logout`,
}

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "lovable_access_token",
  REFRESH_TOKEN: "lovable_refresh_token",
  TOKEN_EXPIRY: "lovable_token_expiry",
  USER_DATA: "lovable_user_data",
}

// Token refresh settings
export const TOKEN_REFRESH = {
  // Refresh token 5 minutes before expiry
  REFRESH_BEFORE_EXPIRY_MS: 5 * 60 * 1000,
  // Maximum refresh attempts before forcing logout
  MAX_REFRESH_ATTEMPTS: 3,
}

// Authentication response types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface UserData {
  id: string
  email: string
  name?: string
  role?: string
}

export interface LoginResponse {
  tokens: AuthTokens
  user: UserData
}

export interface RefreshResponse {
  accessToken: string
  expiresIn: number
}

// Error types
export interface AuthError {
  code: string
  message: string
  status: number
}
