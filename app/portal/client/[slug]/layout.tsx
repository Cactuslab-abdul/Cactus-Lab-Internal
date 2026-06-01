"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PlayCircle, TrendingUp, FileText, Menu, X } from "lucide-react";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

interface Company { id: string; slug: string; name: string; logo_url: string | null; }

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";

  const [company, setCompany] = useState<Company | null>(null);
  const [companyLoaded, setCompanyLoaded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);

  const load = useCallback(async () => {
    if (!slug) return;
    document.title = "Client Portal — Cactus Lab";
    const [coRes, vRes, iRes] = await Promise.all([
      fetch(`/api/portal/v2/companies?slug=${slug}`),
      fetch(`/api/portal/v2/videos?slug=${slug}`),
      fetch(`/api/portal/v2/invoices?slug=${slug}`),
    ]);
    const co = coRes.ok ? await coRes.json() : null;
    const videos = vRes.ok ? await vRes.json() : [];
    const invoices = iRes.ok ? await iRes.json() : [];

    setCompany(co);
    setCompanyLoaded(true);
    if (co?.name) document.title = `${co.name} — Client Portal`;
    if (Array.isArray(videos)) {
      setPendingCount(videos.filter((v: { status: string }) => v.status === "idea_pending" || v.status === "ready_for_review").length);
    }
    if (Array.isArray(invoices)) {
      setUnpaidCount(invoices.filter((i: { status: string }) => i.status === "pending" || i.status === "overdue").length);
    }
  }, [slug]);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

  const base = `/portal/client/${slug}`;
  const nav = [
    { href: base, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `${base}/content`, label: "Content", icon: PlayCircle, badge: pendingCount },
    { href: `${base}/analytics`, label: "Analytics", icon: TrendingUp },
    { href: `${base}/billing`, label: "Billing", icon: FileText, badge: unpaidCount },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  // Company not found state
  if (companyLoaded && !company) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/logo-cactus.png" alt="Cactus Lab" className="w-12 h-12 rounded-2xl object-cover" />
          <div className="text-center">
            <p className="text-white font-bold text-lg leading-tight">Cactus Lab</p>
            <p className="text-[#555] text-sm">Client Portal</p>
          </div>
        </div>
        <div className="w-full max-w-sm bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 text-center">
          <p className="text-white font-semibold text-base mb-2">Portal not found</p>
          <p className="text-[#666] text-sm leading-relaxed">
            We couldn&apos;t find a client portal at this URL. Double-check the link, or reach out to your account manager.
          </p>
          <p className="text-[#444] text-xs mt-4 font-mono">/portal/client/{slug}</p>
        </div>
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
          <p className="text-[#444] text-xs">Client Portal</p>
        </div>
      </div>

      {company && (
        <div className="mb-6 px-3 py-3 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
          <div className="flex items-center gap-2.5">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-green-400">{company.name.charAt(0)}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{company.name}</p>
              <p className="text-[#555] text-xs">Active client</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon, badge, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "text-[#666] hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 px-3 py-3 text-[#444] text-xs">
        Questions? WhatsApp your account manager.
      </div>
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
        <p className="text-white text-sm font-semibold flex-1">Client Portal</p>
        {(pendingCount + unpaidCount) > 0 && (
          <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
            {pendingCount + unpaidCount}
          </span>
        )}
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 flex flex-col">
            <div className="absolute top-4 right-[-48px]">
              <button onClick={() => setMobileOpen(false)} className="text-[#666] hover:text-white transition-colors p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar mobile />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 lg:pt-0 pt-14">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
