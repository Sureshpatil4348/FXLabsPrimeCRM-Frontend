import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateCsrfProtection } from "@/lib/csrf"

// GET /api/get-all-users
// Headers sent upstream:
// - Authorization: <SUPABASE_PROJECT_ANON_KEY> (no Bearer)
// - Admin-Token: <admin token from cookie or header> (no Bearer)
export async function GET(req: Request) {
    try {
        // CSRF protection
        const csrfError = validateCsrfProtection(req)
        if (csrfError) return csrfError

        const url =
            process.env.SUPABASE_GET_ALL_USERS_FUNCTION_URL ||
            process.env.SUPABASE_ALL_GET_USERS_URL ||
            "https://kyqtnxhgokczatymraxb.supabase.co/functions/v1/get-all-users"

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

        const upstream = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: anon,
                "Admin-Token": adminToken, // no Bearer prefix
            },
            cache: "no-store",
        })

        if (!upstream.ok) {
            let body: any = null
            try {
                body = await upstream.json()
            } catch {
                try { body = await upstream.text() } catch {}
            }
            return NextResponse.json(
                { message: "Failed to fetch users", status: upstream.status, details: body },
                { status: upstream.status },
            )
        }

        const data = await upstream.json()
        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ message: "Unexpected server error" }, { status: 500 })
    }
}

