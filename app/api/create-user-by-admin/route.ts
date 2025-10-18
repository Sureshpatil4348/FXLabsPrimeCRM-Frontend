import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// POST /api/create-user-by-admin
// Headers upstream:
// - Authorization: SUPABASE_PROJECT_ANON_KEY (no Bearer)
// - Admin-Token: value from cookie/header (no Bearer)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { users, trial_days } = body as {
      users?: Array<{ email: string; region?: string }>
      trial_days?: number
    }

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Missing or invalid users array" }, { status: 400 })
    }

    // Validate emails
    const invalidEmails = users.filter(user => !user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
    if (invalidEmails.length > 0) {
      return NextResponse.json({ error: "Invalid email format in users array" }, { status: 400 })
    }

    const url =
      process.env.SUPABASE_CREATE_USER_FUNCTION_URL ||
      "https://kyqtnxhgokczatymraxb.supabase.co/functions/v1/create-user-by-admin"

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

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: anon,
        "Admin-Token": adminToken, // no Bearer prefix
      },
      body: JSON.stringify({ users, trial_days: trial_days || 30 }),
    })

    if (!upstream.ok) {
      try {
        const err = await upstream.json()
        return NextResponse.json({ error: err?.message || "Failed to create users" }, { status: upstream.status })
      } catch {
        return NextResponse.json({ error: "Failed to create users" }, { status: upstream.status })
      }
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}
