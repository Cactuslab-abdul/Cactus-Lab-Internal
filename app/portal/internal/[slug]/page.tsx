"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PlayCircle, TrendingUp, FileText, AlertCircle, Loader2, Eye, RefreshCw } from "lucide-react";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

interface Company {
  id: string; slug: string; name: string; logo_url: string|null;
  retainer_aed: number; package_name: string|null; start_date: string|null;
  video_quota: number;
  pending_videos: number; total_videos: number; unpaid_invoices: number;
}

function aed(n: number) { return `AED ${Number(n).toLocaleString("en-AE", { minimumFractionDigits: 0 })}`; }

export default function ClientOverview() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";

  const [company, setCompany] = useState<Company|null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/portal/v2/companies");
      const companies: Company[] = res.ok ? await res.json() : [];
      setCompany(companies.find(c => c.slug === slug) ?? null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#333] animate-spin" /></div>;
  if (!company) return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-12 text-center">
      <p className="text-white font-semibold mb-1">Client not found</p>
      <p className="text-[#555] text-sm">No client with slug &ldquo;{slug}&rdquo;.</p>
      <Link href="/portal/internal" className="inline-block mt-4 text-green-400 hover:text-green-300 text-sm transition-colors">← Back to directory</Link>
    </div>
  );

  const sections = [
    { href: `/portal/internal/${slug}/videos`, icon: PlayCircle, label: "Videos", desc: `${company.total_videos} total · ${company.pending_videos} pending`, urgent: company.pending_videos > 0 },
    { href: `/portal/internal/${slug}/metrics`, icon: TrendingUp, label: "Metrics", desc: "Monthly analytics data" },
    { href: `/portal/internal/${slug}/invoices`, icon: FileText, label: "Invoices", desc: `${company.unpaid_invoices} unpaid`, urgent: company.unpaid_invoices > 0 },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-green-400">{company.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-white text-2xl font-bold truncate">{company.name}</h1>
            {company.package_name && <p className="text-[#555] text-sm mt-0.5 truncate">{company.package_name}</p>}
            <p className="text-green-400 text-sm font-semibold mt-1">{aed(company.retainer_aed)}/month</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={`/portal/client/${company.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all">
            <Eye className="w-3.5 h-3.5" />View as Client
          </a>
          <button onClick={() => void load()} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {(company.pending_videos > 0 || company.unpaid_invoices > 0) && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[#888] text-sm">
            {company.pending_videos > 0 && `${company.pending_videos} video${company.pending_videos !== 1 ? "s" : ""} awaiting client approval. `}
            {company.unpaid_invoices > 0 && `${company.unpaid_invoices} unpaid invoice${company.unpaid_invoices !== 1 ? "s" : ""}.`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sections.map(({ href, icon: Icon, label, desc, urgent }) => (
          <Link key={href} href={href}
            className={`bg-[#111] border rounded-2xl p-5 hover:border-[#2a2a2a] transition-all group ${urgent ? "border-amber-500/20" : "border-[#1e1e1e]"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${urgent ? "bg-amber-500/10" : "bg-[#1a1a1a] group-hover:bg-[#222]"}`}>
              <Icon className={`w-5 h-5 ${urgent ? "text-amber-400" : "text-[#555] group-hover:text-white"}`} />
            </div>
            <p className="text-white font-semibold">{label}</p>
            <p className={`text-xs mt-0.5 ${urgent ? "text-amber-400" : "text-[#555]"}`}>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
