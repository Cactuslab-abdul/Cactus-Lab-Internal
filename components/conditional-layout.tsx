"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname.startsWith("/auth");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
