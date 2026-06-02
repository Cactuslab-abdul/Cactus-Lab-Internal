"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PlayCircle, FileText, TrendingUp, Loader2, Users, Plus, X, Check, RefreshCw, Eye, Trash2 } from "lucide-react";
import type { CompanyWithStats } from "@/lib/portal/types";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

function aed(n: number) {
  return `AED ${Number(n).toLocaleString("en-AE", { minimumFractionDigits: 0 })}`;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  package_name: "Growth Package — 15 Reels/month",
  retainer_aed: 5500,
  video_quota: 15,
  start_date: new Date().toISOString().slice(0, 10),
  email: "",
  instagram: "",
  whatsapp: "",
};

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function InternalDirectory() {
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string|null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/portal/v2/companies");
      const data: CompanyWithStats[] = res.ok ? await res.json() : [];
      setCompanies(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setSaveError(null);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    setSaveError(null);
    const payload = { ...form, slug: form.slug || slugify(form.name) };

    const res = await fetch("/api/portal/v2/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowForm(false);
      void load();
    } else {
      const err = await res.json().catch(() => ({}));
      setSaveError(err.error || `Server error (${res.status}). If the companies table doesn't exist, run supabase/migrations/001_portal_v2.sql in Supabase.`);
    }
    setSaving(false);
  };

  const deleteCompany = async (c: CompanyWithStats) => {
    if (!confirm(`Remove "${c.name}" from the portal? This cannot be undone.`)) return;
    await fetch(`/api/portal/v2/companies/${c.id}`, { method: "DELETE" });
    setCompanies(prev => prev.filter(x => x.id !== c.id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#333] animate-spin" /></div>;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Client Directory</h1>
          <p className="text-[#555] text-sm mt-1">{companies.length} active client{companies.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void load()} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" />Add Client
          </button>
        </div>
      </div>

      {/* Add company form */}
      {showForm && (
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">New Client</h3>
            <button onClick={() => { setShowForm(false); setSaveError(null); }} className="text-[#555] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[#555] text-xs block mb-1.5">Company Name *</label>
              <input value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                placeholder="e.g. Pets Delight"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">URL Slug *</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                placeholder="pets-delight"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none font-mono" />
              <p className="text-[#444] text-[10px] mt-1">Portal URL: /portal/client/{form.slug || "your-slug"}</p>
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-[#555] text-xs block mb-1.5">Package Name</label>
              <input value={form.package_name} onChange={e => setForm(f => ({ ...f, package_name: e.target.value }))}
                placeholder="e.g. Growth Package — 15 Reels/month"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Retainer (AED/month)</label>
              <input type="number" value={form.retainer_aed} onChange={e => setForm(f => ({ ...f, retainer_aed: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Video Quota</label>
              <input type="number" value={form.video_quota} onChange={e => setForm(f => ({ ...f, video_quota: parseInt(e.target.value) || 0 }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Contact Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="hello@company.com"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">WhatsApp</label>
              <input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                placeholder="+971..."
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-[#555] text-xs block mb-1.5">Instagram Handle</label>
              <input value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                placeholder="@company"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
          </div>

          {saveError && (
            <p className="text-red-400 text-sm bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 whitespace-pre-wrap">
              {saveError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={save} disabled={!form.name || saving}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create Client
            </button>
            <button onClick={() => { setShowForm(false); setSaveError(null); }}
              className="px-4 py-2.5 text-[#666] hover:text-white text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {companies.length === 0 && !showForm ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <Users className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No clients yet</p>
          <p className="text-[#555] text-sm mb-4">Get started by creating your first client.</p>
          <button onClick={openNew} className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" />Add First Client
          </button>
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {companies.map(c => (
            <div
              key={c.id}
              className="block bg-[#111] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-2xl p-5 transition-all group"
            >
              <div className="flex items-start gap-3 mb-4">
                {c.logo_url ? (
                  <img src={c.logo_url} alt={c.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-400">{c.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/portal/internal/${c.slug}`} className="text-white font-semibold hover:text-green-400 transition-colors block truncate">{c.name}</Link>
                  {c.package_name && <p className="text-[#555] text-xs mt-0.5 truncate">{c.package_name}</p>}
                </div>
                <span className="text-green-400 text-sm font-semibold flex-shrink-0">{aed(c.retainer_aed)}/mo</span>
                <button onClick={() => void deleteCompany(c)}
                  className="p-1.5 text-[#333] hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className={`rounded-xl p-3 text-center ${c.pending_videos > 0 ? "bg-amber-500/5 border border-amber-500/15" : "bg-[#1a1a1a] border border-[#2a2a2a]"}`}>
                  <p className={`text-lg font-bold ${c.pending_videos > 0 ? "text-amber-400" : "text-white"}`}>{c.pending_videos}</p>
                  <p className={`text-xs mt-0.5 ${c.pending_videos > 0 ? "text-amber-400/70" : "text-[#555]"}`}>Pending</p>
                </div>
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-white">{c.total_videos}</p>
                  <p className="text-[#555] text-xs mt-0.5">Videos</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${c.unpaid_invoices > 0 ? "bg-red-500/5 border border-red-500/15" : "bg-[#1a1a1a] border border-[#2a2a2a]"}`}>
                  <p className={`text-lg font-bold ${c.unpaid_invoices > 0 ? "text-red-400" : "text-white"}`}>{c.unpaid_invoices}</p>
                  <p className={`text-xs mt-0.5 ${c.unpaid_invoices > 0 ? "text-red-400/70" : "text-[#555]"}`}>Unpaid</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1a1a] flex gap-2">
                {[
                  { icon: PlayCircle, label: "Videos", href: `/portal/internal/${c.slug}/videos` },
                  { icon: TrendingUp, label: "Metrics", href: `/portal/internal/${c.slug}/metrics` },
                  { icon: FileText, label: "Invoices", href: `/portal/internal/${c.slug}/invoices` },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[#555] hover:text-white border border-[#2a2a2a] hover:border-[#444] py-2 rounded-lg transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />{label}
                  </Link>
                ))}
              </div>

              <a
                href={`/portal/client/${c.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#666] hover:text-green-400 transition-colors py-2"
              >
                <Eye className="w-3.5 h-3.5" />Open client portal · /portal/client/{c.slug}
              </a>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
