export type Role = "admin" | "partner"

const SESSION_KEY = "tr-referral-session"
const AUTH_TOKENS_KEY = "tr-auth-tokens"

export type Session = {
  email: string
  role: Role
  // Optional JWT returned by backend login API
  token?: string
}

export type AuthTokens = {
  authorization?: string // value as sent in header, e.g. "Bearer <...>"
  adminToken?: string // value as sent in header, e.g. "Bearer <...>"
}

export function verifyCredentials(email: string, password: string, expectedRole: Role): boolean {
  // Credentials are verified by backend only. This function is deprecated.
  // All authentication must go through /api/custom-login endpoint.
  return false
}

export function saveSession(session: Session) {
  if (typeof window === "undefined") return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function signOut() {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(AUTH_TOKENS_KEY)
}

export function saveAuthTokens(tokens: AuthTokens) {
  if (typeof window === "undefined") return
  localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens))
}

export function getAuthTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(AUTH_TOKENS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthTokens
  } catch {
    return null
  }
}
