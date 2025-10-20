import { NextResponse } from "next/server"

// POST /api/custom-login
// Body: { email: string, password: string, role: "admin" | "partner" }
export async function POST(req: Request) {
  try {
  const body = await req.json()
    const { email, password, role: inputRole } = body as {
      email?: string
      password?: string
      role?: "admin" | "partner"
    }

    if (!email || !password || !inputRole) {
      return NextResponse.json({ message: "Missing email, password or role" }, { status: 400 })
    }

    const anon = process.env.SUPABASE_PROJECT_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ANON_KEY || ""
    if (!anon) {
      return NextResponse.json(
        { message: "Server not configured: missing SUPABASE_PROJECT_ANON_KEY" },
        { status: 500 },
      )
    }

    const upstreamUrl =
      process.env.SUPABASE_CUSTOM_LOGIN_FUNCTION_URL ||
      "https://kyqtnxhgokczatymraxb.supabase.co/functions/v1/custom-login"

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: anon, // NOTE: no "Bearer " prefix per requirement
      },
      body: JSON.stringify({ email, password, role: inputRole }),
    })

    if (!upstream.ok) {
      let message = "Login failed"
      try {
        const err = (await upstream.json()) as { message?: string; error?: string }
        if (err?.message) message = err.message
        else if (err?.error) message = err.error
      } catch {}
      return NextResponse.json({ message }, { status: upstream.status })
    }

  // Expected upstream returns: { "Admin-Token": token } or { "Partner-Token": token }
  const data = (await upstream.json()) as { [k: string]: string }

  const adminToken = data["Admin-Token"]
  const partnerToken = data["Partner-Token"]
  const token = adminToken || partnerToken
  const role = adminToken ? "admin" : partnerToken ? "partner" : null

  if (!token || !role) {
    return NextResponse.json({ message: "Malformed upstream response" }, { status: 502 })
  }

    // Set cookie and return success (token only in httpOnly cookie, not in response body)
    const res = NextResponse.json({ success: true })

    const cookieName = role === "admin" ? "admin-token" : "part-token"
    // Store token value as-is (no Bearer prefix) per the contract
    res.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return res
  } catch (e) {
    return NextResponse.json({ message: "Unexpected server error" }, { status: 500 })
  }
}