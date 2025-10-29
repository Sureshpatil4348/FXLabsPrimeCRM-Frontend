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

        const data = {
            "revenue": {
                "total": 0,
                "last_month": 0,
                "currency": "usd"
            },
            "users": {
                "total_users": 18,
                "total_trial": 17,
                "total_paid": 1,
                "total_active": 18,
                "total_expired": 0,
                "total_users_by_region": {
                    "India": 17,
                    "International": 1,
                    "null": 0
                },
                "recent_users_30_days": 17
            },
            "partners": {
                "total_partners": 9,
                "active_partners": 9,
                "total_commission_paid": 0,
                "last_month_commission": 0
            },
            "generated_at": "2025-10-29T17:43:14.127Z"
        }
        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ message: "Unexpected server error" }, { status: 500 })
    }
}
