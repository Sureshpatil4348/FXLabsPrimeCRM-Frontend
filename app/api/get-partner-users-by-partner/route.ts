import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateCsrfProtection } from "@/lib/csrf"

// GET /api/get-partner-users-by-partner
// Headers sent upstream:
// - Authorization: <SUPABASE_PROJECT_ANON_KEY> (no Bearer)
// - Partner-Token: <partner token from cookie or header> (no Bearer)
// - Admin-Token: <admin token from cookie or header> (no Bearer) - for admin access
// Query params (for admin access):
// - partner_id: <partner id to get users for>
export async function GET(req: Request) {
    try {
        // CSRF protection
        const csrfError = validateCsrfProtection(req)
        if (csrfError) return csrfError

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
        
        // Check for admin token first (allows querying any partner's users)
        const cookieAdmin = cookieStore.get("admin-token")?.value
        const headerAdmin = req.headers.get("Admin-Token") || req.headers.get("x-admin-token")
        const adminToken = cookieAdmin || headerAdmin || ""
        
        // Check for partner token (for partner self-access)
        const cookiePartner = cookieStore.get("part-token")?.value
        const headerPartner = req.headers.get("Partner-Token") || req.headers.get("x-partner-token")
        const partnerToken = cookiePartner || headerPartner || ""

        // Parse query parameters for admin access
        const { searchParams } = new URL(req.url)
        const partnerId = searchParams.get("partner_id")

        // Authorization logic
        let token = ""
        let tokenHeader = ""
        
        if (adminToken) {
            // Admin access - can query any partner
            token = adminToken
            tokenHeader = "Admin-Token"
        } else if (partnerToken) {
            // Partner access - can only query their own users
            token = partnerToken
            tokenHeader = "Partner-Token"
        } else {
            return NextResponse.json(
                { message: "Unauthorized", details: "Missing admin-token or part-token cookie or header" },
                { status: 401 },
            )
        }

        // Build upstream URL with partner_id if provided (admin access)
        let upstreamUrl = url
        if (partnerId && adminToken) {
            upstreamUrl += `?partner_id=${encodeURIComponent(partnerId)}`
        }

        const upstream = await fetch(upstreamUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: anon,
                [tokenHeader]: token, // Use the appropriate token header
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
