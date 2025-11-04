import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateCsrfProtection } from "@/lib/csrf"

// GET /api/get-admin-stats
// Headers sent upstream:
// - Authorization: <SUPABASE_PROJECT_ANON_KEY> (no Bearer)
// - Admin-Token: <admin token from cookie or header> (no Bearer)
export async function GET(req: Request) {
    try {
        // CSRF protection
        const csrfError = validateCsrfProtection(req)
        if (csrfError) return csrfError

        const url =
            process.env.SUPABASE_GET_ADMIN_STATS_FUNCTION_URL ||
            "https://kyqtnxhgokczatymraxb.supabase.co/functions/v1/get-admin-stats"

        const anon = process.env.SUPABASE_PROJECT_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ANON_KEY || ""
        if (!anon) {
            return NextResponse.json(
                { message: "Server not configured: missing SUPABASE_PROJECT_ANON_KEY" },
                { status: 500 },
            )
        }

        const cookieStore = await cookies()
        // Prefer cookie; allow header override for flexibility in non-browser calls
        const cookieAdmin = cookieStore.get("admin-token")?.value
        const headerAdmin = req.headers.get("Admin-Token") || req.headers.get("x-admin-token")

        // Support both header and cookie sources
        const adminToken = cookieAdmin || headerAdmin || ""

        if (!adminToken) {
            return NextResponse.json(
                { message: "Unauthorized", details: "Missing admin-token cookie or header" },
                { status: 401 },
            )
        }

        // Call the Supabase Edge Function
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": anon,
                "Admin-Token": adminToken,
                "Content-Type": "application/json"
            }
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Supabase function error:", response.status, errorText)
            return NextResponse.json(
                { message: `Failed to fetch admin stats: ${response.status}` },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ message: "Unexpected server error" }, { status: 500 })
    }
}
