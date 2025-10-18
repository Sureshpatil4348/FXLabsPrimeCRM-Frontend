import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// POST /api/create-partner
// Headers upstream:
// - Authorization: SUPABASE_PROJECT_ANON_KEY (no Bearer)
// - Admin-Token: value from cookie/header (no Bearer)
export async function POST(req: Request) {
  try {
    const { full_name, email, password, commission_percent } = (await req.json()) as {
      full_name?: string
      email?: string
      password?: string
      commission_percent?: number
    }

    if (!full_name || !email || !password || typeof commission_percent !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const url =
      process.env.SUPABASE_CREATE_PARTNER_FUNCTION_URL ||
      process.env.SUPABASE_CREATE_PARTNER_URL ||
      "https://kyqtnxhgokczatymraxb.supabase.co/functions/v1/create-partner"

    const anon = process.env.SUPABASE_PROJECT_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ANON_KEY || ""
    if (!anon) {
      return NextResponse.json({ error: "Server not configured: missing SUPABASE_PROJECT_ANON_KEY" }, { status: 500 })
    }

    const cookieStore = await cookies()
    const cookieAdmin = cookieStore.get("admin-token")?.value

    // Allow header override from client-side calls when not using cookies
    // If you want to allow reading from a header like 'x-admin-token', switch signature to (req: Request)
    // and read: const headerAdmin = req.headers.get('Admin-Token') || req.headers.get('x-admin-token')
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
      body: JSON.stringify({ full_name, email, password, commission_percent }),
    })

    if (!upstream.ok) {
      try {
        const err = await upstream.json()
        return NextResponse.json({ error: err?.message || "Failed to create partner" }, { status: upstream.status })
      } catch {
        return NextResponse.json({ error: "Failed to create partner" }, { status: upstream.status })
      }
    }

    const data = (await upstream.json()) as { full_name: string; email: string }
    return NextResponse.json({ full_name: data.full_name, email: data.email })
  } catch (e) {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}
