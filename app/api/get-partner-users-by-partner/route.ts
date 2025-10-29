import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateCsrfProtection } from "@/lib/csrf"

// GET /api/get-partner-users-by-partner (for partners - no body)
// POST /api/get-partner-users-by-partner (for admins - with JSON body {"partner_email": "email"})
export async function GET(req: Request) {
    return handleRequest(req, 'GET')
}

export async function POST(req: Request) {
    return handleRequest(req, 'POST')
}

async function handleRequest(req: Request, method: 'GET' | 'POST') {
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

        // Parse request body for POST requests (admin access)
        let partnerEmail = null
        if (method === 'POST') {
            try {
                const body = await req.json()
                partnerEmail = body.partner_email
            } catch (e) {
                return NextResponse.json(
                    { message: "Invalid JSON body for POST request" },
                    { status: 400 },
                )
            }
        }

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

        // Build upstream URL with partner_email if provided (admin POST access)
        let upstreamUrl = url
        if (partnerEmail && adminToken && method === 'POST') {
            upstreamUrl += `?partner_email=${encodeURIComponent(partnerEmail)}`
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
