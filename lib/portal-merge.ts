// Single source of truth for client metadata = `app-data/clients.json`.
// `app-data/portal/{slug}.json` owns ONLY portal-specific data
// (contentItems, analytics, invoices, agencyWhatsApp, monthlyVideoQuota).
// This helper overlays clients.json fields onto a PortalData blob so the
// portal UI always sees the latest logo / package / retainer / contact info
// regardless of whether the portal blob has stale copies.

import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PortalData } from "./portal-types";

export function adminStorageClient() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

interface ClientRecord {
  id: string;
  name: string;
  logoUrl: string;
  package: string;
  retainerAED: number;
  discountedRate?: number;
  fullRateDate?: string;
  services: string;
  contactName: string;
  contactEmail: string;
  contactWhatsApp: string;
  startDate: string;
}

export async function loadClientRecord(supabase: SupabaseClient, slug: string): Promise<ClientRecord | null> {
  try {
    const { data, error } = await supabase.storage.from("app-data").download("clients.json");
    if (error || !data) return null;
    const list = JSON.parse(await data.text()) as ClientRecord[];
    return list.find(c => c.id === slug) ?? null;
  } catch {
    return null;
  }
}

export function mergePortalWithClient(portal: PortalData, client: ClientRecord | null): PortalData {
  if (!client) return portal;
  // primaryContact* on the package represents the AGENCY-side account manager
  // (Awab) — distinct from clients.json contact* fields which are the CLIENT-side
  // contact (Raveena/Marwan). Leave primaryContact* in portal data only.
  return {
    ...portal,
    clientName: client.name || portal.clientName,
    logoUrl: client.logoUrl || portal.logoUrl,
    package: {
      ...portal.package,
      name: client.package || portal.package.name,
      retainerAED: client.retainerAED || portal.package.retainerAED,
      services: client.services
        ? client.services.split("\n").map(s => s.trim()).filter(Boolean)
        : portal.package.services,
      startDate: client.startDate || portal.package.startDate,
    },
  };
}
