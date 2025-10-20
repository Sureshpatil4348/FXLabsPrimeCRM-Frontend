import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// POST /api/create-user
// Headers upstream:
// - Authorization: SUPABASE_PROJECT_ANON_KEY (no Bearer)
// - Admin-Token: value from cookie/header (no Bearer) for admin
// - Partner-Token: value from cookie/header (no Bearer) for partner
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { users, region, trial_days, emails } = body as {
      users?: Array<{ email: string } | string>
      region?: string
      trial_days?: number
      emails?: string // comma-separated emails
    }

    let userArray: Array<{ email: string; region?: string }> = []
    const effectiveRegion = (region && String(region).trim()) || "India"

    // Handle different input formats
    if (emails) {
      // Comma-separated emails
      const emailList = emails.split(',').map(email => email.trim()).filter(email => email.length > 0)
      userArray = emailList.map(email => ({ email }))
    } else if (Array.isArray(users)) {
      // Array of user objects
      userArray = users.map(user => ({
        email: typeof user === 'string' ? user : user.email,
      }))
    } else if (typeof users === 'string') {
      // Single email string
      userArray = [{ email: users }]
    }

    if (!userArray || userArray.length === 0) {
      return NextResponse.json({ error: "No valid emails provided" }, { status: 400 })
    }

    // Validate emails
    const invalidEmails = userArray.filter(user => !user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
    if (invalidEmails.length > 0) {
      return NextResponse.json({ error: "Invalid email format in user list" }, { status: 400 })
    }

    const url =
      process.env.SUPABASE_CREATE_USER_FUNCTION_URL ||
      "https://kyqtnxhgokczatymraxb.supabase.co/functions/v1/create-user"

    const anon = process.env.SUPABASE_PROJECT_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ANON_KEY || ""
    if (!anon) {
      return NextResponse.json({ error: "Server not configured: missing SUPABASE_PROJECT_ANON_KEY" }, { status: 500 })
    }

    const cookieStore = await cookies()
    const cookieAdmin = cookieStore.get("admin-token")?.value
    const cookiePartner = cookieStore.get("part-token")?.value

    const adminToken = cookieAdmin || ""
    const partnerToken = cookiePartner || ""

    if (!adminToken && !partnerToken) {
      return NextResponse.json({ error: "Unauthorized: missing token" }, { status: 401 })
    }

    const token = adminToken || partnerToken
    const tokenHeader = adminToken ? "Admin-Token" : "Partner-Token"

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: anon,
        [tokenHeader]: token, // no Bearer prefix
      },
      body: JSON.stringify({
        users: userArray,
        region: effectiveRegion,
        trial_days: trial_days || 30
      }),
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
