import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// PATCH /api/update-user-data
// Headers sent upstream:
// - Authorization: <SUPABASE_PROJECT_ANON_KEY> (includes Bearer prefix)
// - Admin-Token: <admin token from cookie> (no Bearer)
export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const url =
      process.env.SUPABASE_UPDATE_USER_DATA_FUNCTION_URL ||
      "https://hyajwhtkwldrmlhfiuwg.supabase.co/functions/v1/crm_update-user-reset-email"

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
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: anon,
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
        { error: errorData?.error || "Failed to update user" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    )
  }
}
