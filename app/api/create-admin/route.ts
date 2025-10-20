import { NextResponse } from "next/server"
import { cookies } from "next/headers"


export async function POST(req: Request) {
  try {
    // CSRF: allow only same-origin (or env-configured) requests
    const selfOrigin = new URL(req.url).origin
    const allowed = (process.env.ALLOWED_ORIGINS || selfOrigin)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const origin = req.headers.get("origin") || ""
    const referer = req.headers.get("referer") || ""
    const passOrigin = !origin || allowed.includes(origin)
    const passReferer = !referer || allowed.some(a => referer.startsWith(a))
    if (!passOrigin || !passReferer) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 })
    }

    const body = await req.json()
    const { email, full_name, password, current_admin_password } = body as {
      email?: string
      full_name?: string
      password?: string
      current_admin_password?: string
    }

    // Basic validation
    if (!email || !full_name || !password || !current_admin_password) {
      return NextResponse.json({ error: "Missing required fields: email, full_name, password, current_admin_password" }, { status: 400 })
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const url = process.env.SUPABASE_CREATE_ADMIN_FUNCTION_URL || "https://kyqtnxhgokczatymraxb.supabase.co/functions/v1/create-admin"

    const anon = process.env.SUPABASE_PROJECT_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ANON_KEY || ""
    if (!anon) {
      return NextResponse.json({ error: "Server not configured: missing SUPABASE_PROJECT_ANON_KEY" }, { status: 500 })
    }

    const cookieStore = await cookies()
    const adminToken = cookieStore.get("admin-token")?.value

    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized: missing admin token" }, { status: 401 })
    }

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: anon,
        "Admin-Token": adminToken,
      },
      body: JSON.stringify({
        email,
        full_name,
        password,
        current_admin_password
      }),
    })

    if (!upstream.ok) {
      try {
        const err = await upstream.json()
        return NextResponse.json({ error: err?.message || "Failed to create admin" }, { status: upstream.status })
      } catch {
        return NextResponse.json({ error: "Failed to create admin" }, { status: upstream.status })
      }
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}
