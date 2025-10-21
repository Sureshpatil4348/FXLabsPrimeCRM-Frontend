import { NextResponse } from "next/server"
import { validateOrigin } from "@/lib/csrf"

// POST /api/logout
// Clears the session cookies
export async function POST(req: Request) {
  try {
    // Origin validation for state-changing requests
    const originError = validateOrigin(req)
    if (originError) return originError

    // Clear session cookies
    const res = NextResponse.json({ success: true })

    // Clear admin token cookie
    res.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    // Clear partner token cookie
    res.cookies.set("part-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    return res
  } catch (e) {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}