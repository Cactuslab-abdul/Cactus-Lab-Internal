"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, X, Check, Loader2, Trash2, TrendingUp, Edit2, RefreshCw, Eye } from "lucide-react";
import type { Metric, PlatformStats, PlatformData } from "@/lib/portal/types";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

interface Company { id: string; name: string; slug: string; }

type Platform = "instagram" | "facebook" | "tiktok" | "linkedin";
const PLATFORMS: { key: Platform; label: string; color: string }[] = [
  { key: "instagram", label: "Instagram", color: "text-pink-400" },
  { key: "facebook",  label: "Facebook",  color: "text-blue-400" },
  { key: "tiktok",    label: "TikTok",    color: "text-white" },
  { key: "linkedin",  label: "LinkedIn",  color: "text-sky-400" },
];

const EMPTY_PLATFORM: PlatformStats = { followers: 0, followers_change: 0, views: 0, reach: 0, engagement_rate: 0 };

const EMPTY_PLATFORM_DATA: PlatformData = {
  instagram: { ...EMPTY_PLATFORM },
  facebook:  { ...EMPTY_PLATFORM },
  tiktok:    { ...EMPTY_PLATFORM },
  linkedin:  { ...EMPTY_PLATFORM },
};

const EMPTY_FORM = {
  month: new Date().toISOString().slice(0, 7),
  top_post_url: "",
  notes: "",
  platform_data: EMPTY_PLATFORM_DATA,
};

function calcTotals(pd: PlatformData): PlatformStats {
  const platforms = Object.values(pd).filter(Boolean) as PlatformStats[];
  if (!platforms.length) return { ...EMPTY_PLATFORM };
  const filled = platforms.filter(p => p.followers > 0 || p.views > 0 || p.reach > 0);
  return {
    followers: platforms.reduce((s, p) => s + (p.followers || 0), 0),
    followers_change: platforms.reduce((s, p) => s + (p.followers_change || 0), 0),
    views: platforms.reduce((s, p) => s + (p.views || 0), 0),
    reach: platforms.reduce((s, p) => s + (p.reach || 0), 0),
    engagement_rate: filled.length
      ? parseFloat((filled.reduce((s, p) => s + (p.engagement_rate || 0), 0) / filled.length).toFixed(2))
      : 0,
  };
}

function fmtMonth(ym: string) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m)-1, 1).toLocaleDateString("en-AE", { month: "long", year: "numeric" });
}

function Field({ label, type = "number", value, onChange, placeholder, readOnly }: {
  label: string; type?: string; value: string|number; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-[#555] text-xs block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full border rounded-lg px-3 py-2.5 text-white text-sm outline-none ${
          readOnly
            ? "bg-[#141414] border-[#1e1e1e] text-[#666] cursor-default"
            : "bg-[#1a1a1a] border-[#2a2a2a] placeholder-[#444] focus:border-green-500/50"
        }`} />
    </div>
  );
}

export default function MetricsPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";

  const [company, setCompany] = useState<Company|null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activePlatform, setActivePlatform] = useState<Platform>("instagram");
  const [editing, setEditing] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string|null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setRefreshing(true);
    try {
      const coRes = await fetch("/api/portal/v2/companies");
      const companies: (Company & { slug: string })[] = coRes.ok ? await coRes.json() : [];
      const c = Array.isArray(companies) ? companies.find(x => x.slug === slug) : null;
      setCompany(c ?? null);
      if (c) {
        const mRes = await fetch(`/api/portal/v2/metrics?company_id=${c.id}`);
        setMetrics(mRes.ok ? await mRes.json() : []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

  const setPlatformField = (platform: Platform, field: keyof PlatformStats, raw: string) => {
    const val = field === "engagement_rate" ? parseFloat(raw) || 0 : parseInt(raw) || 0;
    setForm(f => ({
      ...f,
      platform_data: {
        ...f.platform_data,
        [platform]: { ...(f.platform_data[platform] ?? EMPTY_PLATFORM), [field]: val },
      },
    }));
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setSaveError(null);
    setActivePlatform("instagram");
    setShowForm(true);
  };

  const openEdit = (m: Metric) => {
    setForm({
      month: (m.month || "").slice(0, 7),
      top_post_url: m.top_post_url ?? "",
      notes: m.notes ?? "",
      platform_data: m.platform_data ?? EMPTY_PLATFORM_DATA,
    });
    setEditing(m.id);
    setSaveError(null);
    setActivePlatform("instagram");
    setShowForm(true);
  };

  const save = async () => {
    if (!company) return;
    setSaving(true);
    setSaveError(null);

    const totals = calcTotals(form.platform_data);
    const payload = {
      company_id: company.id,
      month: form.month,
      top_post_url: form.top_post_url || null,
      notes: form.notes || null,
      platform_data: form.platform_data,
      ...totals,
    };

    const res = editing
      ? await fetch(`/api/portal/v2/metrics/${editing}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        })
      : await fetch("/api/portal/v2/metrics", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });

    if (res.ok) {
      const updated: Metric = await res.json();
      setMetrics(prev => {
        const filtered = editing ? prev.filter(m => m.id !== editing) : prev.filter(m => m.id !== updated.id);
        return [updated, ...filtered].sort((a, b) => b.month.localeCompare(a.month));
      });
      setShowForm(false);
      setEditing(null);
    } else {
      const err = await res.json().catch(() => ({}));
      setSaveError(err.error || `Server error (${res.status}).`);
    }
    setSaving(false);
  };

  const deleteMetric = async (id: string) => {
    if (!confirm("Delete this month's metrics?")) return;
    const res = await fetch(`/api/portal/v2/metrics/${id}`, { method: "DELETE" });
    if (res.ok) setMetrics(prev => prev.filter(m => m.id !== id));
  };

  const totals = calcTotals(form.platform_data);
  const activePlatformData = form.platform_data[activePlatform] ?? EMPTY_PLATFORM;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#333] animate-spin" /></div>;

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-white text-2xl font-bold truncate">{company?.name ?? slug} — Metrics</h1>
          <p className="text-[#555] text-sm mt-1">Input monthly analytics per platform.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {company && (
            <a href={`/portal/client/${company.slug}/analytics`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all">
              <Eye className="w-3.5 h-3.5" />View as Client
            </a>
          )}
          <button onClick={() => void load()} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" />Add Month
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">{editing ? "Edit Metrics" : "New Month"}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); setSaveError(null); }} className="text-[#555] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Month */}
          <div className="max-w-[200px]">
            <Field label="Month" type="month" value={form.month} onChange={v => setForm(f => ({ ...f, month: v }))} />
          </div>

          {/* Platform tabs */}
          <div>
            <p className="text-[#555] text-xs uppercase tracking-wide font-semibold mb-3">Platform Data</p>
            <div className="flex gap-1 mb-4 bg-[#0a0a0a] p-1 rounded-xl w-fit">
              {PLATFORMS.map(p => (
                <button key={p.key} onClick={() => setActivePlatform(p.key)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activePlatform === p.key
                      ? `bg-[#1e1e1e] ${p.color}`
                      : "text-[#444] hover:text-[#888]"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Followers (end of month)" value={activePlatformData.followers}
                onChange={v => setPlatformField(activePlatform, "followers", v)} />
              <Field label="Follower Change (+/-)" value={activePlatformData.followers_change}
                onChange={v => setPlatformField(activePlatform, "followers_change", v)} />
              <Field label="Total Views" value={activePlatformData.views}
                onChange={v => setPlatformField(activePlatform, "views", v)} />
              <Field label="Reach (unique accounts)" value={activePlatformData.reach}
                onChange={v => setPlatformField(activePlatform, "reach", v)} />
              <Field label="Engagement Rate (%)" value={activePlatformData.engagement_rate}
                onChange={v => setPlatformField(activePlatform, "engagement_rate", v)} />
            </div>
          </div>

          {/* Auto-calculated totals */}
          <div>
            <p className="text-[#555] text-xs uppercase tracking-wide font-semibold mb-3">
              Totals (auto-calculated across all platforms)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Followers", value: totals.followers.toLocaleString() },
                { label: "Total Views", value: totals.views.toLocaleString() },
                { label: "Total Reach", value: totals.reach.toLocaleString() },
                { label: "Avg Engagement", value: `${totals.engagement_rate}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3">
                  <p className="text-[#444] text-xs mb-1">{label}</p>
                  <p className="text-white font-bold text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-1 gap-4">
            <Field label="Top Post URL (optional)" type="text" value={form.top_post_url}
              onChange={v => setForm(f => ({ ...f, top_post_url: v }))} placeholder="https://instagram.com/p/..." />
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Notes (shown to client)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} placeholder="e.g. Strong growth from the product demo reel."
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none resize-none" />
            </div>
          </div>

          {saveError && (
            <p className="text-red-400 text-sm bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 whitespace-pre-wrap">{saveError}</p>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editing ? "Save Changes" : "Add Metrics"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setSaveError(null); }}
              className="px-4 py-2.5 text-[#666] hover:text-white text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {metrics.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <TrendingUp className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No metrics yet. Add the first month.</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["Month","Followers","Views","Reach","Engagement",""].map((h, i) => (
                  <th key={i} className={`text-[#555] text-xs font-medium px-4 py-3 ${i === 0 ? "text-left" : i < 5 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={m.id} className={i < metrics.length - 1 ? "border-b border-[#141414]" : ""}>
                  <td className="px-4 py-3 text-white font-medium">
                    {fmtMonth(m.month)}
                    {m.platform_data && <span className="ml-2 text-[10px] bg-green-500/10 border border-green-500/15 text-green-400 px-1.5 py-0.5 rounded">4 platforms</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-[#aaa]">
                    {m.followers.toLocaleString()}
                    {m.followers_change !== 0 && (
                      <span className={`ml-1 text-xs ${m.followers_change > 0 ? "text-green-400" : "text-red-400"}`}>
                        {m.followers_change > 0 ? "+" : ""}{m.followers_change}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-[#aaa]">{m.views >= 1000 ? `${(m.views/1000).toFixed(1)}K` : m.views}</td>
                  <td className="px-4 py-3 text-right text-[#aaa]">{m.reach >= 1000 ? `${(m.reach/1000).toFixed(1)}K` : m.reach}</td>
                  <td className={`px-4 py-3 text-right font-medium ${m.engagement_rate >= 3 ? "text-green-400" : "text-[#888]"}`}>{m.engagement_rate}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-[#444] hover:text-white transition-colors rounded-lg hover:bg-[#1a1a1a]">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteMetric(m.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
