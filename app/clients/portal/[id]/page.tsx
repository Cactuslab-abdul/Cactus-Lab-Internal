"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRole } from "@/lib/useRole";
import PortalManagement from "@/components/portal-management";

/**
 * Deep-link wrapper for the portal management UI.
 * The same component is also embedded inline on /clients.
 * Kept here so existing links like /clients/portal/pets-delight still work.
 */
export default function PortalAdminPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useRole();
  const clientId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.replace("/clients");
    }
  }, [roleLoading, isAdmin, router]);

  if (roleLoading || !isAdmin) {
    return (
      <div className="space-y-4 fade-in">
        <div className="h-10 skeleton rounded-xl w-48" />
        <div className="h-32 skeleton rounded-2xl" />
        <div className="h-48 skeleton rounded-2xl" />
      </div>
    );
  }

  return (
    <PortalManagement
      clientId={clientId}
      onClose={() => router.push("/clients")}
    />
  );
}
