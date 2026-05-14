"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "editor";

export function useRole() {
  const [role, setRole] = useState<UserRole>("admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const r = user?.user_metadata?.role;
      setRole(r === "editor" ? "editor" : "admin");
      setLoading(false);
    });
  }, []);

  return { role, isAdmin: role === "admin", isEditor: role === "editor", loading };
}
