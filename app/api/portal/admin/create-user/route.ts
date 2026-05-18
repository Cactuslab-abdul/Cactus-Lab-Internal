import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";

function adminClient() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  // Only internal team can call this
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, password, slug } = await req.json() as { email: string; password: string; slug: string };
  if (!email || !password || !slug) {
    return NextResponse.json({ error: "email, password, and slug are required" }, { status: 400 });
  }

  const admin = adminClient();

  // Create the auth user with the given password (no invite email sent)
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: email.toLowerCase().trim(),
    password,
    email_confirm: true,
  });

  if (createError) {
    // If user already exists, update their password instead
    if (createError.message.includes("already been registered") || createError.message.includes("already exists")) {
      const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
      const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
      if (existing) {
        const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, { password });
        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
      } else {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }
  }

  // Update portal-access.json in Supabase Storage (email → slug map)
  let accessMap: Record<string, string> = {};
  try {
    const { data: existing } = await admin.storage.from("app-data").download("portal-access.json");
    if (existing) {
      const text = await existing.text();
      accessMap = JSON.parse(text);
    }
  } catch {}

  accessMap[email.toLowerCase().trim()] = slug;

  await admin.storage.from("app-data").upload(
    "portal-access.json",
    JSON.stringify(accessMap, null, 2),
    { contentType: "application/json", upsert: true }
  );

  return NextResponse.json({ success: true, userId: created?.user?.id });
}
