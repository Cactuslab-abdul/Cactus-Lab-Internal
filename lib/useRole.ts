"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "editor";

// These emails always get full admin access regardless of user_metadata
const ADMIN_EMAILS = [
  "abdulrahman@cactuslab.ae",
  "awab.sirelkhatim@gmail.com",
  "abdul.ahmed.eg@gmail.com",
  "abdulrahman@cactuslab.ae",
  "awab@cactuslab.ae",
  "hello@cactuslab.ae",
];

export function isAdminEmail(email: string | undefined): boolean {
  return ADMIN_EMAILS.includes((email || "").toLowerCase());
}

export function useRole() {
  const [role, setRole] = useState<UserRole>("editor");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const email = user?.email || "";
      const metaRole = user?.user_metadata?.role;
      const isAdmin = isAdminEmail(email) || metaRole === "admin";
      setRole(isAdmin ? "admin" : "editor");
      setLoading(false);
    });
  }, []);

  return { role, isAdmin: role === "admin", isEditor: role === "editor", loading };
}
