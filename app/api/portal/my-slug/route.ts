import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { CLIENT_EMAIL_MAP } from "@/lib/portal-auth";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) return NextResponse.json({ slug: null });

  const email = user.email.toLowerCase().trim();

  // Check hardcoded map first (fast, always works)
  if (CLIENT_EMAIL_MAP[email]) {
    return NextResponse.json({ slug: CLIENT_EMAIL_MAP[email] });
  }

  // Fall back to dynamic map in Supabase Storage
  try {
    const admin = createAdminSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data } = await admin.storage.from("app-data").download("portal-access.json");
    if (data) {
      const map = JSON.parse(await data.text()) as Record<string, string>;
      if (map[email]) return NextResponse.json({ slug: map[email] });
    }
  } catch {}

  return NextResponse.json({ slug: null });
}
