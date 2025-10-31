import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateOrigin } from "@/lib/csrf";

type CommissionSlab = {
  min_revenue: number;
  max_revenue: number | null;
  commission_percent: number;
};

// PATCH /api/update-partner-data
// Headers sent upstream:
// - Authorization: <SUPABASE_PROJECT_ANON_KEY> (includes Bearer prefix)
// - Admin-Token: <admin token from cookie> (no Bearer)
export async function PATCH(req: Request) {
  try {
    // Origin validation for state-changing requests
    const originError = validateOrigin(req);
    if (originError) return originError;

    const body = await req.json();
    const { partner_id, email, full_name, is_active, commission_percent, commission_slabs } = body as {
      partner_id?: string;
      email?: string;
      full_name?: string;
      is_active?: boolean;
      commission_percent?: number;
      commission_slabs?: {
        slabs: Array<CommissionSlab>
      };
    };

    // Basic validation
    if (!partner_id) {
      return NextResponse.json({ error: "Missing required field: partner_id" }, { status: 400 });
    }

    // Check if at least one field to update is provided
    if (!email && !full_name && is_active === undefined && commission_percent === undefined && !commission_slabs) {
      return NextResponse.json({ error: "At least one field must be provided for update" }, { status: 400 });
    }

    const url = process.env.SUPABASE_UPDATE_PARTNER_DATA_FUNCTION_URL ||
      "https://hyajwhtkwldrmlhfiuwg.supabase.co/functions/v1/crm_update-partner-data";

    const anon = process.env.SUPABASE_PROJECT_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ANON_KEY || "";
    if (!anon) {
      return NextResponse.json({ error: "Server not configured: missing SUPABASE_PROJECT_ANON_KEY" }, { status: 500 });
    }

    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin-token")?.value;

    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized: missing admin token" }, { status: 401 });
    }

    // Call the Supabase Edge Function
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": anon,
        "Admin-Token": adminToken,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to update partner" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
