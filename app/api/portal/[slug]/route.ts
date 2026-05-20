import { NextRequest, NextResponse } from "next/server";
import { PORTAL_SEEDS } from "@/lib/portal-seed";
import { adminStorageClient, loadClientRecord, mergePortalWithClient } from "@/lib/portal-merge";
import type { PortalData } from "@/lib/portal-types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const admin = adminStorageClient();

  let portalData: PortalData | null = null;
  try {
    const { data, error } = await admin.storage
      .from("app-data")
      .download(`portal/${slug}.json`);
    if (!error && data) {
      portalData = JSON.parse(await data.text()) as PortalData;
    }
  } catch {
    // fall through to seed
  }

  if (!portalData) {
    portalData = PORTAL_SEEDS[slug] ?? null;
  }
  if (!portalData) {
    return NextResponse.json({ error: "Portal not found" }, { status: 404 });
  }

  // Overlay clients.json fields (logo, package, retainer, contact, etc.) so
  // the portal always reflects what was last edited on the /clients page.
  const client = await loadClientRecord(admin, slug);
  return NextResponse.json(mergePortalWithClient(portalData, client));
}
