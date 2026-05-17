import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PORTAL_SEEDS } from "@/lib/portal-seed";
import type { PortalData } from "@/lib/portal-types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("app-data")
      .download(`portal/${slug}.json`);

    if (!error && data) {
      const text = await data.text();
      const portalData = JSON.parse(text) as PortalData;
      return NextResponse.json(portalData);
    }
  } catch {
    // fall through to seed data
  }

  const seed = PORTAL_SEEDS[slug];
  if (seed) {
    return NextResponse.json(seed);
  }

  return NextResponse.json({ error: "Portal not found" }, { status: 404 });
}
