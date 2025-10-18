import { NextResponse } from "next/server"

// POST /api/logout
export async function POST() {
  // Overwrite cookies with immediate expiry to clear them
  const res = NextResponse.json({ ok: true })
  res.cookies.set("admin-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  res.cookies.set("part-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  return res
}