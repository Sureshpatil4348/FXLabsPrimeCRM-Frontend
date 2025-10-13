export type Role = "admin" | "partner"

const DEFAULT_USERS: Record<string, { password: string; role: Role }> = {
  "admin@123.com": { password: "123456", role: "admin" },
  "inf@123.com": { password: "123456", role: "partner" },
}

const SESSION_KEY = "tr-referral-session"

export type Session = {
  email: string
  role: Role
}

export function verifyCredentials(email: string, password: string, expectedRole: Role): boolean {
  const user = DEFAULT_USERS[email.trim().toLowerCase()]
  if (!user) return false
  return user.password === password && user.role === expectedRole
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
}
