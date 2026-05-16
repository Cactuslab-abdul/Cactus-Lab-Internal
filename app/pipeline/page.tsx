"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Download,
  Plus,
  Trash2,
  Mail,
} from "lucide-react";

const STAGES = [
  { key: "Prospecting", color: "#888780", bg: "#3a3a38" },
  { key: "Messaged", color: "#60a5fa", bg: "#1e3a5f" },
  { key: "Replied", color: "#a78bfa", bg: "#2d1f6e" },
  { key: "Proposal", color: "#fb923c", bg: "#5c2d0d" },
  { key: "Closed", color: "#4ade80", bg: "#14532d" },
  { key: "Lost", color: "#f87171", bg: "#4c1d1d" },
];

const NICHES = ["Perfume", "Watch", "Car", "Recruitment", "Spice", "Restaurant", "Retail", "Pet", "Real Estate & Construction", "Other"];
const CHANNELS = ["Instagram DM", "Walk-in", "WhatsApp", "Referral", "Cold call"];

interface Lead {
  id: number;
  name: string;
  niche: string;
  platform: string;
  stage: string;
  note: string;
  date: string;
  followup: string;
}

const DEFAULT_LEADS: Lead[] = [
  { id: 1, name: "Al Fares Perfumes", niche: "Perfume", platform: "Walk-in", stage: "Proposal", note: "Owner interested, follow up Tue", date: "2026-05-01", followup: "" },
  { id: 2, name: "Deira Auto Parts", niche: "Car", platform: "Instagram DM", stage: "Replied", note: "Asked for pricing", date: "2026-05-01", followup: "" },
  { id: 3, name: "Gulf Recruitment Co", niche: "Recruitment", platform: "Instagram DM", stage: "Messaged", note: "", date: "2026-05-01", followup: "" },
  { id: 4, name: "Spice House Sharjah", niche: "Spice", platform: "Walk-in", stage: "Prospecting", note: "Good footfall, weak IG", date: "2026-05-01", followup: "" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface Client {
  id: string;
  name: string;
  retainerAED?: number;
  discountedRate?: number;
  fullRateDate?: string;
  monthlyRetainer?: number;
}

function clientEffectiveRate(c: Client): number {
  if (
    c.discountedRate && c.discountedRate > 0 &&
    c.fullRateDate &&
    new Date() < new Date(c.fullRateDate + "T00:00:00")
  ) return c.discountedRate;
  return c.retainerAED ?? c.monthlyRetainer ?? 0;
}

export default function PipelinePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [nextId, setNextId] = useState(6);
  const [activeTab, setActiveTab] = useState("All");
  const [form, setForm] = useState({ name: "", niche: "", platform: "", followup: "", note: "" });

  useEffect(() => {
    const raw = localStorage.getItem("cactus-leads");
    const rawId = localStorage.getItem("cactus-leads-nextid");
    const rawClients = localStorage.getItem("cactus-clients");
    if (raw) {
      try { setLeads(JSON.parse(raw)); } catch {}
    } else {
      setLeads(DEFAULT_LEADS);
      localStorage.setItem("cactus-leads", JSON.stringify(DEFAULT_LEADS));
    }
    if (rawId) setNextId(parseInt(rawId, 10));
    if (rawClients) {
      try { setClients(JSON.parse(rawClients)); } catch {}
    }
  }, []);

  const save = useCallback((updatedLeads: Lead[], updatedNextId?: number) => {
    localStorage.setItem("cactus-leads", JSON.stringify(updatedLeads));
    if (updatedNextId !== undefined) {
      localStorage.setItem("cactus-leads-nextid", String(updatedNextId));
    }
  }, []);

  const addLead = () => {
    if (!form.name.trim()) return;
    const newLead: Lead = {
      id: nextId,
      name: form.name.trim(),
      niche: form.niche || "Other",
      platform: form.platform || "Instagram DM",
      stage: "Prospecting",
      note: form.note.trim(),
      date: todayStr(),
      followup: form.followup,
    };
    const updated = [newLead, ...leads];
    const newNextId = nextId + 1;
    setLeads(updated);
    setNextId(newNextId);
    save(updated, newNextId);
    setForm({ name: "", niche: "", platform: "", followup: "", note: "" });
    setActiveTab("All");
  };

  const changeStage = (id: number, stage: string) => {
    const updated = leads.map(l => l.id === id ? { ...l, stage } : l);
    setLeads(updated);
    save(updated);
  };

  const changeFollowup = (id: number, val: string) => {
    const updated = leads.map(l => l.id === id ? { ...l, followup: val } : l);
    setLeads(updated);
    save(updated);
  };

  const deleteLead = (id: number) => {
    if (!confirm("Remove this lead?")) return;
    const updated = leads.filter(l => l.id !== id);
    setLeads(updated);
    save(updated);
  };

  const exportCSV = () => {
    const headers = ["Name", "Niche", "Channel", "Stage", "Follow-up date", "Note", "Date added"];
    const rows = leads.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      l.niche || "",
      l.platform || "",
      l.stage,
      l.followup || "",
      `"${(l.note || "").replace(/"/g, '""')}"`,
      l.date,
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "cactus_pipeline_" + todayStr() + ".csv";
    a.click();
  };

  // Action needed logic
  const getActionNeeded = () => {
    const t = todayStr();
    const actions: { lead: Lead; label: string; overdue: boolean }[] = [];
    leads.forEach(l => {
      if (["Closed", "Lost"].includes(l.stage)) return;
      if (l.followup && l.followup <= t) {
        actions.push({ lead: l, label: l.followup < t ? "Overdue" : "Due today", overdue: l.followup < t });
      }
      if (!l.followup) {
        const added = new Date(l.date + "T00:00:00");
        const diff = Math.floor((new Date(t).getTime() - added.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 3 && l.stage === "Messaged") actions.push({ lead: l, label: "Day 3 follow-up", overdue: false });
        if (diff === 7 && ["Messaged", "Replied"].includes(l.stage)) actions.push({ lead: l, label: "Day 7 final", overdue: true });
      }
    });
    return actions;
  };

  const actionItems = getActionNeeded();
  const today = todayStr();

  // Metrics
  const closed = leads.filter(l => l.stage === "Closed").length;
  const active = leads.filter(l => !["Closed", "Lost"].includes(l.stage)).length;
  const mrr = clients.reduce((sum, c) => sum + clientEffectiveRate(c), 0);
  const followupsDue = leads.filter(l => l.followup && l.followup <= today && !["Closed", "Lost"].includes(l.stage)).length;

  // Filtered
  const filtered = activeTab === "All" ? leads : leads.filter(l => l.stage === activeTab);

  const stageCounts: Record<string, number> = { All: leads.length };
  STAGES.forEach(s => { stageCounts[s.key] = leads.filter(l => l.stage === s.key).length; });

  const followupClass = (d: string) => {
    if (!d) return "";
    if (d < today) return "text-red-400 font-semibold";
    if (d === today) return "text-yellow-400 font-semibold";
    return "";
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Pipeline</h1>
        <p className="text-[#666] mt-1">Track every lead from first message to closed client</p>
      </div>

      {/* Action needed banner */}
      {actionItems.length > 0 && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">Action needed today</span>
            </div>
            <span className="text-xs bg-green-900/50 text-green-400 px-2.5 py-1 rounded-full">
              {actionItems.length} lead{actionItems.length !== 1 ? "s" : ""} need follow-up
            </span>
          </div>
          <div className="space-y-2">
            {actionItems.map((a, i) => (
              <div key={i} className="flex items-center gap-3 bg-green-950/40 rounded-lg px-3 py-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  a.overdue ? "bg-red-900/60 text-red-300" : "bg-yellow-900/60 text-yellow-300"
                }`}>
                  {a.label}
                </span>
                <span className="text-green-100 text-sm font-medium flex-1">{a.lead.name}</span>
                <span className="text-[#666] text-xs">{a.lead.stage} · added {a.lead.date}</span>
                <button
                  onClick={() => router.push(`/outreach?business=${encodeURIComponent(a.lead.name)}&niche=${encodeURIComponent(a.lead.niche)}`)}
                  className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  Outreach
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total leads", value: leads.length, color: "text-white" },
          { label: "In pipeline", value: active, color: "text-white" },
          { label: "Closed", value: closed, color: "text-green-400" },
          { label: "Est. MRR", value: `AED ${mrr.toLocaleString()}`, color: "text-green-400" },
          { label: "Follow-ups due", value: followupsDue, color: followupsDue > 0 ? "text-yellow-400" : "text-white" },
        ].map(m => (
          <div key={m.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4">
            <p className="text-[#555] text-xs uppercase tracking-wider mb-1">{m.label}</p>
            <p className={`text-xl font-semibold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Main table card */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
        {/* Top row */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Lead pipeline</h3>
          <div className="flex items-center gap-3">
            <span className="text-[#555] text-xs">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</span>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-1.5 rounded-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Add lead form */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-5">
          <input
            className="sm:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
            placeholder="Business name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && addLead()}
          />
          <select
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
            value={form.niche}
            onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}
          >
            <option value="">Niche</option>
            {NICHES.map(n => <option key={n}>{n}</option>)}
          </select>
          <select
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
            value={form.platform}
            onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
          >
            <option value="">Channel</option>
            {CHANNELS.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            type="date"
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
            value={form.followup}
            onChange={e => setForm(f => ({ ...f, followup: e.target.value }))}
          />
          <button
            onClick={addLead}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Stage tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {["All", ...STAGES.map(s => s.key)].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeTab === tab
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-[#888] border-[#2a2a2a] hover:border-[#444] hover:text-white"
              }`}
            >
              {tab} <span className="opacity-60">{stageCounts[tab] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <p className="text-center text-[#555] py-10 text-sm">No leads in this stage yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Business", "Niche", "Channel", "Stage", "Follow-up", "Note", "Added", ""].map(h => (
                    <th key={h} className="text-left text-[10px] text-[#555] uppercase tracking-wider pb-3 px-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const stageInfo = STAGES.find(s => s.key === l.stage);
                  return (
                    <tr key={l.id} className="border-t border-[#1a1a1a] hover:bg-[#151515] transition-colors">
                      <td className="py-3 px-2 text-white text-sm font-medium">{l.name}</td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] bg-[#1e1e1e] text-[#888] px-2 py-0.5 rounded-full">{l.niche || "—"}</span>
                      </td>
                      <td className="py-3 px-2 text-[#666] text-sm">{l.platform || "—"}</td>
                      <td className="py-3 px-2">
                        <select
                          value={l.stage}
                          onChange={e => changeStage(l.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded-lg border-0 focus:outline-none cursor-pointer font-semibold"
                          style={{
                            backgroundColor: stageInfo?.bg || "#1e1e1e",
                            color: stageInfo?.color || "#888",
                          }}
                        >
                          {STAGES.map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="date"
                          value={l.followup || ""}
                          onChange={e => changeFollowup(l.id, e.target.value)}
                          className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs focus:outline-none focus:border-green-500/50 ${followupClass(l.followup)}`}
                        />
                      </td>
                      <td className="py-3 px-2 text-[#666] text-xs max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap" title={l.note}>
                        {l.note || "—"}
                      </td>
                      <td className="py-3 px-2 text-[#555] text-xs">{l.date}</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => deleteLead(l.id)}
                          className="text-[#444] hover:text-red-400 transition-colors p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
