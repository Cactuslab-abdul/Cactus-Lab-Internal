import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "app-data";

// Service-role client — bypasses RLS, server-side only
const adminStorage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
).storage;

async function getAuthedUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: NextRequest) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = req.nextUrl.searchParams.get("key");
  if (!key || !/^[\w-]+$/.test(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const { data, error } = await adminStorage.from(BUCKET).download(`${key}.json`);
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const text = await data.text();
  return new NextResponse(text, {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = req.nextUrl.searchParams.get("key");
  if (!key || !/^[\w-]+$/.test(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const body = await req.text();
  const blob = new Blob([body], { type: "application/json" });

  const { error } = await adminStorage
    .from(BUCKET)
    .upload(`${key}.json`, blob, { upsert: true, contentType: "application/json" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
