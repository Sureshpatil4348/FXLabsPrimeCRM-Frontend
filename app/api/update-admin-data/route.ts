import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateOrigin } from "@/lib/csrf";

// PATCH /api/update-admin-data
// Headers sent upstream:
// - Authorization: <SUPABASE_PROJECT_ANON_KEY> (includes Bearer prefix)
// - Admin-Token: <admin token from cookie> (no Bearer)
export async function PATCH(req: Request) {
  try {
    // Origin validation for state-changing requests
    const originError = validateOrigin(req);
    if (originError) return originError;

    const body = await req.json();
    const { existing_email, email, full_name, current_password, new_password } = body as {
      existing_email?: string;
      email?: string;
      full_name?: string;
      current_password?: string;
      new_password?: string;
    };

    // Basic validation
    if (!existing_email) {
      return NextResponse.json({ error: "Missing required field: existing_email" }, { status: 400 });
    }

    // Check if at least one field to update is provided
    if (!email && !full_name && !new_password) {
      return NextResponse.json({ error: "At least one field must be provided for update" }, { status: 400 });
    }

    // Validate password change requirements
    if (new_password && !current_password) {
      return NextResponse.json({ error: "Current password is required when changing password" }, { status: 400 });
    }

    const url = process.env.SUPABASE_UPDATE_ADMIN_DATA_FUNCTION_URL ||
      "https://hyajwhtkwldrmlhfiuwg.supabase.co/functions/v1/crm_update-admin-data";

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
        { error: data.error || "Failed to update admin" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
