"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, X, Check, Loader2, Trash2, TrendingUp, Edit2, RefreshCw, Eye } from "lucide-react";
import type { Metric } from "@/lib/portal/types";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

interface Company { id: string; name: string; slug: string; }

const EMPTY_FORM = {
  month: new Date().toISOString().slice(0, 7),
  followers: 0, followers_change: 0, views: 0, reach: 0,
  engagement_rate: 0, top_post_url: "", notes: "",
};

function fmtMonth(ym: string) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m)-1, 1).toLocaleDateString("en-AE", { month: "long", year: "numeric" });
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

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setSaveError(null);
    setShowForm(true);
  };

  const openEdit = (m: Metric) => {
    setForm({
      month: (m.month || "").slice(0, 7),
      followers: m.followers,
      followers_change: m.followers_change,
      views: m.views,
      reach: m.reach,
      engagement_rate: Number(m.engagement_rate),
      top_post_url: m.top_post_url ?? "",
      notes: m.notes ?? "",
    });
    setEditing(m.id);
    setSaveError(null);
    setShowForm(true);
  };

  const save = async () => {
    if (!company) return;
    setSaving(true);
    setSaveError(null);
    const payload = { ...form, company_id: company.id };

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
      setSaveError(err.error || `Server error (${res.status}). If the metrics table doesn't exist yet, run supabase/migrations/001_portal_v2.sql in Supabase.`);
    }
    setSaving(false);
  };

  const deleteMetric = async (id: string) => {
    if (!confirm("Delete this month's metrics?")) return;
    const res = await fetch(`/api/portal/v2/metrics/${id}`, { method: "DELETE" });
    if (res.ok) setMetrics(prev => prev.filter(m => m.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#333] animate-spin" /></div>;

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-white text-2xl font-bold truncate">{company?.name ?? slug} — Metrics</h1>
          <p className="text-[#555] text-sm mt-1">Input monthly analytics data for the client portal.</p>
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
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">{editing ? "Edit Metrics" : "New Month"}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); setSaveError(null); }} className="text-[#555] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Month" type="month" value={form.month} onChange={v => setForm(f => ({ ...f, month: v }))} />
            <Field label="Followers (end of month)" value={form.followers} onChange={v => setForm(f => ({ ...f, followers: parseInt(v)||0 }))} />
            <Field label="Follower Change (+/-)" value={form.followers_change} onChange={v => setForm(f => ({ ...f, followers_change: parseInt(v)||0 }))} />
            <Field label="Total Views" value={form.views} onChange={v => setForm(f => ({ ...f, views: parseInt(v)||0 }))} />
            <Field label="Reach (unique accounts)" value={form.reach} onChange={v => setForm(f => ({ ...f, reach: parseInt(v)||0 }))} />
            <Field label="Engagement Rate (%)" value={form.engagement_rate} onChange={v => setForm(f => ({ ...f, engagement_rate: parseFloat(v)||0 }))} />
            <div className="col-span-2">
              <Field label="Top Post URL (optional)" type="text" value={form.top_post_url} onChange={v => setForm(f => ({ ...f, top_post_url: v }))} placeholder="https://instagram.com/p/..." />
            </div>
            <div className="col-span-2">
              <label className="text-[#555] text-xs block mb-1.5">Notes (shown to client)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} placeholder="e.g. Strong growth from the product demo reel."
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none resize-none" />
            </div>
          </div>

          {saveError && (
            <p className="text-red-400 text-sm bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 whitespace-pre-wrap">
              {saveError}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editing ? "Save Changes" : "Add Metrics"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setSaveError(null); }} className="px-4 py-2.5 text-[#666] hover:text-white text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {metrics.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <TrendingUp className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No metrics yet. Add the first month to start showing data to the client.</p>
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
                  <td className="px-4 py-3 text-white font-medium">{fmtMonth(m.month)}</td>
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

function Field({ label, type = "number", value, onChange, placeholder }: {
  label: string; type?: string; value: string|number; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[#555] text-xs block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
    </div>
  );
}
