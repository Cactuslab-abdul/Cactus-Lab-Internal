import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { CLIENT_EMAIL_MAP } from "@/lib/portal-auth";
import { PORTAL_SEEDS } from "@/lib/portal-seed";
import { adminStorageClient } from "@/lib/portal-merge";
import type { PortalData, ContentStatus } from "@/lib/portal-types";

type Action = "approve" | "revise";
type AdminClient = ReturnType<typeof adminStorageClient>;

async function slugForAuthedEmail(email: string, admin: AdminClient): Promise<string | null> {
  const key = email.toLowerCase().trim();
  if (CLIENT_EMAIL_MAP[key]) return CLIENT_EMAIL_MAP[key];
  try {
    const { data } = await admin.storage.from("app-data").download("portal-access.json");
    if (data) {
      const map = JSON.parse(await data.text()) as Record<string, string>;
      return map[key] ?? null;
    }
  } catch {}
  return null;
}

function nextStatus(current: ContentStatus, action: Action): ContentStatus | null {
  if (action === "approve") {
    if (current === "idea_pending") return "idea_approved";
    if (current === "ready_for_review") return "client_approved";
    return null;
  }
  // revise
  if (current === "idea_pending" || current === "ready_for_review") return "idea_revision";
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = adminStorageClient();

  const userSlug = await slugForAuthedEmail(user.email, admin);
  if (!userSlug || userSlug !== slug) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as { itemId?: string; action?: Action; note?: string };
  if (!body.itemId || (body.action !== "approve" && body.action !== "revise")) {
    return NextResponse.json({ error: "itemId and action ('approve'|'revise') required" }, { status: 400 });
  }
  if (body.action === "revise" && !body.note?.trim()) {
    return NextResponse.json({ error: "note required for revise action" }, { status: 400 });
  }

  // Load current portal data (from storage if exists, else seed)
  let portalData: PortalData | null = null;
  try {
    const { data, error } = await admin.storage.from("app-data").download(`portal/${slug}.json`);
    if (!error && data) {
      portalData = JSON.parse(await data.text()) as PortalData;
    }
  } catch {}
  if (!portalData) {
    portalData = PORTAL_SEEDS[slug] ?? null;
  }
  if (!portalData) {
    return NextResponse.json({ error: "Portal not found" }, { status: 404 });
  }

  // Find and update the content item
  const idx = portalData.contentItems.findIndex(i => i.id === body.itemId);
  if (idx === -1) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }
  const item = portalData.contentItems[idx];
  const next = nextStatus(item.status, body.action);
  if (!next) {
    return NextResponse.json({ error: `Cannot ${body.action} from status '${item.status}'` }, { status: 409 });
  }

  const now = new Date().toISOString();
  portalData.contentItems[idx] = {
    ...item,
    status: next,
    clientNote: body.action === "revise" ? body.note!.trim() : item.clientNote,
    updatedAt: now,
  };
  portalData.updatedAt = now;

  // Save via service role
  const blob = new Blob([JSON.stringify(portalData, null, 2)], { type: "application/json" });
  const { error: uploadError } = await admin.storage
    .from("app-data")
    .upload(`portal/${slug}.json`, blob, { contentType: "application/json", upsert: true });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, item: portalData.contentItems[idx] });
}
