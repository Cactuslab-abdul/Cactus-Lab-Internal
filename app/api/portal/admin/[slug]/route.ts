import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PORTAL_SEEDS } from "@/lib/portal-seed";
import type { PortalData } from "@/lib/portal-types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase.storage
      .from("app-data")
      .download(`portal/${slug}.json`);

    if (!error && data) {
      const text = await data.text();
      return NextResponse.json(JSON.parse(text) as PortalData);
    }
  } catch {
    // fall through
  }

  const seed = PORTAL_SEEDS[slug];
  return seed
    ? NextResponse.json(seed)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as PortalData;
  body.updatedAt = new Date().toISOString();

  const blob = new Blob([JSON.stringify(body, null, 2)], { type: "application/json" });

  const { error } = await supabase.storage
    .from("app-data")
    .upload(`portal/${slug}.json`, blob, {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
