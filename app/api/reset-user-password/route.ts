import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// POST /api/reset-user-password
// Headers sent upstream:
// - Authorization: <SUPABASE_PROJECT_ANON_KEY> (no Bearer)
// - Admin-Token: <admin token from cookie> (no Bearer)
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const url =
      process.env.SUPABASE_RESET_USER_PASSWORD_FUNCTION_URL ||
      "https://hyajwhtkwldrmlhfiuwg.supabase.co/functions/v1/crm_reset-user-password"

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
        "Admin-Token": adminToken // no Bearer prefix
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      let errorData: any = null
      try {
        errorData = await response.json()
      } catch {
        try {
          errorData = await response.text()
        } catch {}
      }
      return NextResponse.json(
        { error: errorData?.error || "Failed to reset password" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
