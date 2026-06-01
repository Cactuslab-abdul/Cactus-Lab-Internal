"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Users, LogOut, Menu, X, Shield, ChevronLeft } from "lucide-react";

export default function InternalPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSlugPage = pathname.match(/^\/portal\/internal\/[^/]+/);

  useEffect(() => {
    // Login page is inside this layout but doesn't need auth check
    if (pathname === "/portal/internal/login") {
      document.title = "Agency Login — Cactus Lab";
      setAuthorized(false);
      return;
    }
    document.title = "Agency Portal — Cactus Lab";
    fetch("/api/portal/admin/me").then(r => {
      if (r.ok) {
        setAuthorized(true);
      } else {
        router.replace("/portal/internal/login");
      }
    });
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/portal/admin/login", { method: "DELETE" });
    router.push("/portal/internal/login");
  };

  // On login page — render children naked (no layout chrome)
  if (pathname === "/portal/internal/login") {
    return <>{children}</>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={mobile
      ? "flex flex-col h-full bg-[#0f0f0f] border-r border-[#1e1e1e] p-5 w-72"
      : "hidden lg:flex flex-col h-screen sticky top-0 bg-[#0f0f0f] border-r border-[#1e1e1e] p-5 w-64 flex-shrink-0"
    }>
      <div className="flex items-center gap-3 mb-8">
        <img src="/logo-cactus.png" alt="Cactus Lab" className="w-8 h-8 rounded-xl object-cover" />
        <div>
          <p className="text-white text-sm font-bold leading-tight">Cactus Lab</p>
          <p className="text-[#444] text-xs">Agency Portal</p>
        </div>
      </div>

      <div className="mb-6 px-3 py-3 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold">Admin</p>
            <p className="text-[#555] text-xs">Cactus Lab</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <Link href="/portal/internal" onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname === "/portal/internal"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "text-[#666] hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          Client Directory
        </Link>
      </nav>

      <button onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#444] hover:text-red-400 hover:bg-red-500/5 transition-all mt-4"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0f0f0f]/95 backdrop-blur border-b border-[#1e1e1e] h-14 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-[#666] hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <img src="/logo-cactus.png" alt="Cactus Lab" className="w-6 h-6 rounded-lg object-cover" />
        <p className="text-white text-sm font-semibold flex-1">Agency Portal</p>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 lg:pt-0 pt-14">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {isSlugPage && (
            <Link href="/portal/internal" className="inline-flex items-center gap-1.5 text-[#555] hover:text-white text-sm mb-6 transition-colors">
              <ChevronLeft className="w-4 h-4" />Back to clients
            </Link>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
