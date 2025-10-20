import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// GET /api/get-partner-users-by-partner
// Headers sent upstream:
// - Authorization: <SUPABASE_PROJECT_ANON_KEY> (no Bearer)
// - Partner-Token: <partner token from cookie or header> (no Bearer)
export async function GET() {
    try {
        const url =
            process.env.SUPABASE_GET_PARTNER_USERS_FUNCTION_URL ||
            "https://kyqtnxhgokczatymraxb.supabase.co/functions/v1/get-partner-users-by-partner"

        const anon = process.env.SUPABASE_PROJECT_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ANON_KEY || ""
        if (!anon) {
            return NextResponse.json(
                { message: "Server not configured: missing SUPABASE_PROJECT_ANON_KEY" },
                { status: 500 },
            )
        }

        const cookieStore = await cookies()
        // Prefer cookie; allow header override for flexibility in non-browser calls
        const cookiePartner = cookieStore.get("part-token")?.value

        // Support clients passing 'x-partner-token' header by using a fetch Request from the runtime if needed.
        // Since Next.js route handlers don't give us headers without a Request param for GET,
        // we will only use cookies here. Clients can set the cookie via /api/custom-login.
        const partnerToken = cookiePartner || ""

        if (!partnerToken) {
            return NextResponse.json(
                { message: "Unauthorized", details: "Missing part-token cookie" },
                { status: 401 },
            )
        }

        const upstream = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: anon,
                "Partner-Token": partnerToken, // no Bearer prefix
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
                { message: "Failed to fetch partner users", status: upstream.status, details: body },
                { status: upstream.status },
            )
        }

        const data = await upstream.json()
        return NextResponse.json(data)
    } catch (e) {
        return NextResponse.json({ message: "Unexpected server error" }, { status: 500 })
    }
}
