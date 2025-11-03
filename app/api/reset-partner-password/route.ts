import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateOrigin } from "@/lib/csrf"

// POST /api/reset-partner-password
// Headers sent upstream:
// - Authorization: <SUPABASE_PROJECT_ANON_KEY> (includes Bearer prefix)
// - Admin-Token: <admin token from cookie> (no Bearer)
export async function POST(req: Request) {
  try {
    // Origin validation for state-changing request
    const originError = validateOrigin(req);
    if (originError) return originError;

    const body = await req.json()

    // Validate required fields for password reset
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: "Missing or invalid email field!" }, { status: 400 })
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const url = process.env.SUPABASE_RESET_PARTNER_PASSWORD_FUNCTION_URL

    if (!url) {
      return NextResponse.json({ error: "Server not configured: missing SUPABASE_RESET_PARTNER_PASSWORD_FUNCTION_URL" }, { status: 500 })
    }

    const anon = process.env.SUPABASE_PROJECT_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ANON_KEY || ""
    if (!anon) {
      return NextResponse.json({ error: "Server not configured: missing SUPABASE_PROJECT_ANON_KEY" }, { status: 500 })
    }

    const cookieStore = await cookies()
    const cookieAdmin = cookieStore.get("admin-token")?.value

    const adminToken = cookieAdmin || ""

    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized: missing admin token" }, { status: 401 })
    }

    // Call the edge function
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: anon, // Keep the full "Bearer ..." from env
        "Admin-Token": adminToken, // no Bearer prefix
      },
      body: JSON.stringify({ email: body.email }),
    })

    const data = await response.json()

    if (!response.ok && response.status !== 207) {
      return NextResponse.json({ error: data.error || "Failed to reset partner password" }, { status: response.status })
    }

    // Return the response from the edge function
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error in reset-partner-password API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}