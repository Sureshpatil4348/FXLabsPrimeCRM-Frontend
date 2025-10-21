import { NextResponse } from "next/server"

/**
 * Validates Origin and Referer headers for CSRF protection
 * Requires Origin header to be present and valid
 * Referer is optional but must be valid if present
 */
export function validateOrigin(req: Request): NextResponse | null {
  const selfOrigin = new URL(req.url).origin
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || selfOrigin)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")

  // Require Origin header to be present and valid
  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 })
  }

  // If Referer is present, it must be valid
  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 })
  }

  return null // Origin validation passed
}

/**
 * Validates Origin and Referer headers for CSRF protection (legacy for GET requests)
 * Allows missing Origin/Referer headers for backward compatibility
 */
export function validateCsrfProtection(req: Request): NextResponse | null {
  const selfOrigin = new URL(req.url).origin
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || selfOrigin)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")

  // Allow missing Origin/Referer for backward compatibility (GET requests)
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 })
  }

  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 })
  }

  return null // CSRF protection passed
}