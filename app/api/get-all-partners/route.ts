import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// GET /api/get-all-partners
// Headers sent upstream:
// - Authorization: <SUPABASE_PROJECT_ANON_KEY> (no Bearer)
// - Admin-Token: <admin token from cookie or header> (no Bearer)
export async function GET(req: Request) {
    try {
        const url =
            process.env.SUPABASE_GET_ALL_PARTNERS_FUNCTION_URL ||
            "https://kyqtnxhgokczatymraxb.supabase.co/functions/v1/get-all-partners"

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
        const adminToken = headerAdmin || cookieAdmin || ""

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
                { message: "Failed to fetch partners", status: upstream.status, details: body },
                { status: upstream.status },
            )
        }

    const data = await upstream.json()
    // Pass-through response expected to look like the new schema provided
    // { partners: [...], pagination: {...}, filters: { sort_by: string } }
    return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ message: "Unexpected server error" }, { status: 500 })
    }
}
