"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Save, Trash2, ExternalLink,
  PlayCircle, TrendingUp, FileText, Package,
  CheckCircle2, Loader2, X,
  KeyRound, Copy, Eye, EyeOff, ArrowLeft,
} from "lucide-react";
import type { PortalData, ContentItem, ContentStatus, ContentType, AnalyticsWeek, PortalInvoice } from "@/lib/portal-types";
import { PORTAL_SEEDS } from "@/lib/portal-seed";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const STATUS_LABELS: Record<ContentStatus, string> = {
  idea_pending: "Awaiting Client Approval",
  idea_approved: "Idea Approved",
  idea_revision: "Revision Requested",
  in_production: "In Production",
  ready_for_review: "Ready for Client Review",
  client_approved: "Client Approved",
  posted: "Live / Posted",
};

const STATUS_COLORS: Record<ContentStatus, string> = {
  idea_pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  idea_revision: "bg-red-500/10 text-red-400 border-red-500/20",
  idea_approved: "bg-green-500/10 text-green-400 border-green-500/20",
  in_production: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ready_for_review: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  client_approved: "bg-green-500/10 text-green-400 border-green-500/20",
  posted: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

const CONTENT_TYPES: ContentType[] = ["Reel", "Story", "Post", "TikTok", "LinkedIn"];
const STATUSES = Object.keys(STATUS_LABELS) as ContentStatus[];

function inputCls(extra = "") {
  return `w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-[#3a3a3a] outline-none ${extra}`;
}

type Tab = "content" | "analytics" | "invoices" | "settings";

// ─── Content tab ──────────────────────────────────────────────────────────────

function ContentTab({ data, onChange }: { data: PortalData; onChange: (d: PortalData) => void }) {
  const [month, setMonth] = useState(currentMonth());
  const [addingItem, setAddingItem] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const empty = (): Omit<ContentItem, "id" | "createdAt" | "updatedAt"> => ({
    month,
    number: (data.contentItems.filter(i => i.month === month).length) + 1,
    title: "",
    type: "Reel",
    ideaDescription: "",
    status: "idea_pending",
    videoUrl: "",
    thumbnailUrl: "",
    postedUrl: "",
    caption: "",
    clientNote: "",
  });

  const [newItem, setNewItem] = useState(empty());

  const monthItems = data.contentItems.filter(i => i.month === month).sort((a, b) => a.number - b.number);
  const allMonths = Array.from(new Set(data.contentItems.map(i => i.month))).sort().reverse();

  const addItem = () => {
    if (!newItem.title.trim()) return;
    const item: ContentItem = {
      ...newItem,
      id: uid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onChange({ ...data, contentItems: [...data.contentItems, item] });
    setNewItem(empty());
    setAddingItem(false);
  };

  const updateItem = (updated: ContentItem) => {
    onChange({
      ...data,
      contentItems: data.contentItems.map(i => i.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : i),
    });
    setEditingId(null);
  };

  const deleteItem = (id: string) => {
    onChange({ ...data, contentItems: data.contentItems.filter(i => i.id !== id) });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 overflow-x-auto">
          {allMonths.map(m => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                m === month
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-[#111] border-[#1e1e1e] text-[#666] hover:text-[#aaa]"
              }`}
            >
              {new Date(m + "-01T00:00:00").toLocaleDateString("en-AE", { month: "long", year: "numeric" })}
            </button>
          ))}
        </div>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-1.5 text-sm text-white outline-none focus:border-[#3a3a3a]"
        />
      </div>

      {!addingItem && (
        <button
          onClick={() => { setNewItem(empty()); setAddingItem(true); }}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Content Item
        </button>
      )}

      {addingItem && (
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold text-sm">New Content Item</p>
            <button onClick={() => setAddingItem(false)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">#</label>
              <input
                type="number"
                value={newItem.number}
                onChange={e => setNewItem(p => ({ ...p, number: Number(e.target.value) }))}
                className={inputCls()}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Title *</label>
              <input
                value={newItem.title}
                onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Summer Pet Care Checklist"
                className={inputCls()}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Type</label>
              <select value={newItem.type} onChange={e => setNewItem(p => ({ ...p, type: e.target.value as ContentType }))} className={inputCls("appearance-none")}>
                {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Status</label>
              <select value={newItem.status} onChange={e => setNewItem(p => ({ ...p, status: e.target.value as ContentStatus }))} className={inputCls("appearance-none")}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Idea / Concept</label>
            <textarea
              value={newItem.ideaDescription}
              onChange={e => setNewItem(p => ({ ...p, ideaDescription: e.target.value }))}
              placeholder="Describe the idea, hook, format, CTA..."
              rows={4}
              className={inputCls("resize-none")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Video URL (when ready)</label>
              <input value={newItem.videoUrl ?? ""} onChange={e => setNewItem(p => ({ ...p, videoUrl: e.target.value }))} placeholder="Drive / WeTransfer link" className={inputCls()} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Posted URL (when live)</label>
              <input value={newItem.postedUrl ?? ""} onChange={e => setNewItem(p => ({ ...p, postedUrl: e.target.value }))} placeholder="instagram.com/p/..." className={inputCls()} />
            </div>
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Caption (for client approval)</label>
            <textarea value={newItem.caption ?? ""} onChange={e => setNewItem(p => ({ ...p, caption: e.target.value }))} rows={4} placeholder="The caption that will be posted with the video — hashtags, copy, mentions" className={inputCls("resize-none")} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={addItem} disabled={!newItem.title.trim()} className="bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Add Item</button>
            <button onClick={() => setAddingItem(false)} className="bg-[#1a1a1a] border border-[#2a2a2a] text-white font-medium px-5 py-2.5 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {monthItems.length === 0 && !addingItem && (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-10 text-center">
            <PlayCircle className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3" />
            <p className="text-[#555] text-sm">No content for this month yet. Add an item above.</p>
          </div>
        )}
        {monthItems.map(item => (
          <ContentItemRow
            key={item.id}
            item={item}
            editing={editingId === item.id}
            onEdit={() => setEditingId(item.id)}
            onSave={updateItem}
            onCancel={() => setEditingId(null)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ContentItemRow({
  item, editing, onEdit, onSave, onCancel, onDelete,
}: {
  item: ContentItem;
  editing: boolean;
  onEdit: () => void;
  onSave: (i: ContentItem) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<ContentItem>(item);

  useEffect(() => { setForm(item); }, [item]);

  if (editing) {
    return (
      <div className="bg-[#111] border border-green-500/20 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">#</label>
            <input type="number" value={form.number} onChange={e => setForm(f => ({ ...f, number: Number(e.target.value) }))} className={inputCls()} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls()} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ContentType }))} className={inputCls("appearance-none")}>
              {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContentStatus }))} className={inputCls("appearance-none")}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Idea / Concept</label>
          <textarea value={form.ideaDescription} onChange={e => setForm(f => ({ ...f, ideaDescription: e.target.value }))} rows={3} className={inputCls("resize-none")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Video URL</label>
            <input value={form.videoUrl ?? ""} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="Drive / WeTransfer link" className={inputCls()} />
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Posted URL</label>
            <input value={form.postedUrl ?? ""} onChange={e => setForm(f => ({ ...f, postedUrl: e.target.value }))} placeholder="instagram.com/p/..." className={inputCls()} />
          </div>
        </div>
        <div>
          <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Caption (for client approval)</label>
          <textarea value={form.caption ?? ""} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} rows={4} placeholder="The caption that will be posted with the video — hashtags, copy, mentions" className={inputCls("resize-none")} />
        </div>
        <div>
          <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Client Note (if revision)</label>
          <input value={form.clientNote ?? ""} onChange={e => setForm(f => ({ ...f, clientNote: e.target.value }))} placeholder="Client's feedback message" className={inputCls()} />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={() => onSave(form)} className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> Save
          </button>
          <button onClick={onCancel} className="bg-[#1a1a1a] border border-[#2a2a2a] text-white font-medium px-5 py-2.5 rounded-xl text-sm">Cancel</button>
          <button onClick={onDelete} className="ml-auto bg-red-900/10 border border-red-500/15 text-red-400 px-4 py-2.5 rounded-xl text-sm hover:bg-red-900/20 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors">
      <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-xs font-bold text-[#666] flex-shrink-0">
        {item.number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{item.title}</p>
        <p className="text-[#555] text-xs">{item.type}</p>
      </div>
      <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[item.status]}`}>
        {STATUS_LABELS[item.status]}
      </span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {item.postedUrl && <a href={item.postedUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[#444] hover:text-teal-400 transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>}
        <button onClick={onEdit} className="p-1.5 text-[#444] hover:text-white transition-colors text-xs font-medium hover:bg-[#1a1a1a] rounded-lg px-2 py-1">Edit</button>
      </div>
    </div>
  );
}

// ─── Analytics tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ data, onChange }: { data: PortalData; onChange: (d: PortalData) => void }) {
  const [adding, setAdding] = useState(false);
  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const emptyEntry = (): Omit<AnalyticsWeek, "id" | "enteredAt"> => ({
    weekDate: todayISO,
    instagram: { followers: 0, followersChange: 0, views: 0, reach: 0, engagementRate: 0, topPostUrl: "" },
    tiktok: { followers: 0, followersChange: 0, views: 0 },
    notes: "",
  });

  const [form, setForm] = useState(emptyEntry());

  const addEntry = () => {
    const entry: AnalyticsWeek = { ...form, id: uid(), enteredAt: new Date().toISOString() };
    onChange({ ...data, analytics: [...data.analytics, entry] });
    setForm(emptyEntry());
    setAdding(false);
  };

  const deleteEntry = (id: string) => {
    onChange({ ...data, analytics: data.analytics.filter(a => a.id !== id) });
  };

  const sorted = [...data.analytics].sort((a, b) => b.weekDate.localeCompare(a.weekDate));

  return (
    <div className="space-y-5">
      {!adding && (
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Add Weekly Analytics
        </button>
      )}

      {adding && (
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold text-sm">New Analytics Entry</p>
            <button onClick={() => setAdding(false)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Week Starting</label>
            <input type="date" value={form.weekDate} onChange={e => setForm(f => ({ ...f, weekDate: e.target.value }))} className={inputCls("w-auto")} />
          </div>
          <div>
            <p className="text-[#555] text-xs uppercase tracking-wide font-semibold mb-3">Instagram</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: "followers", label: "Followers" },
                { key: "followersChange", label: "Change" },
                { key: "views", label: "Views" },
                { key: "reach", label: "Reach" },
                { key: "engagementRate", label: "Engagement %" },
              ].map(({ key, label }) => (
                <label key={key} className="block">
                  <span className="text-[#666] text-xs font-medium block mb-1.5">{label}</span>
                  <input
                    type="number"
                    step={key === "engagementRate" ? "0.1" : "1"}
                    value={(form.instagram as Record<string, unknown>)[key] as number ?? 0}
                    onChange={e => setForm(f => ({ ...f, instagram: { ...f.instagram, [key]: Number(e.target.value) } }))}
                    className={inputCls()}
                  />
                </label>
              ))}
              <label className="block sm:col-span-3">
                <span className="text-[#666] text-xs font-medium block mb-1.5">Top Post URL</span>
                <input
                  value={form.instagram.topPostUrl ?? ""}
                  onChange={e => setForm(f => ({ ...f, instagram: { ...f.instagram, topPostUrl: e.target.value } }))}
                  placeholder="https://instagram.com/p/..."
                  className={inputCls()}
                />
              </label>
            </div>
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Notes</label>
            <textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="What drove performance this week?" className={inputCls("resize-none")} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={addEntry} className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Add Entry</button>
            <button onClick={() => setAdding(false)} className="bg-[#1a1a1a] border border-[#2a2a2a] text-white font-medium px-5 py-2.5 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !adding && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-10 text-center">
          <TrendingUp className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No analytics entries yet. Add weekly data above.</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(entry => (
          <div key={entry.id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">
                  {new Date(entry.weekDate + "T00:00:00").toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <div className="flex flex-wrap gap-4 mt-2">
                  <span className="text-[#aaa] text-xs">Followers: <span className="text-white font-medium">{entry.instagram.followers.toLocaleString()}</span> <span className={entry.instagram.followersChange > 0 ? "text-green-400" : "text-red-400"}>{entry.instagram.followersChange > 0 ? "+" : ""}{entry.instagram.followersChange}</span></span>
                  <span className="text-[#aaa] text-xs">Views: <span className="text-white font-medium">{entry.instagram.views >= 1000 ? `${(entry.instagram.views / 1000).toFixed(1)}K` : entry.instagram.views}</span></span>
                  <span className="text-[#aaa] text-xs">Engagement: <span className="text-white font-medium">{entry.instagram.engagementRate}%</span></span>
                </div>
                {entry.notes && <p className="text-[#555] text-xs mt-2 italic">&quot;{entry.notes}&quot;</p>}
              </div>
              <button onClick={() => deleteEntry(entry.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Invoices tab ──────────────────────────────────────────────────────────────

function InvoicesTab({ data, onChange }: { data: PortalData; onChange: (d: PortalData) => void }) {
  const [adding, setAdding] = useState(false);
  const now = new Date();

  const emptyInvoice = (): Omit<PortalInvoice, "id"> => ({
    number: "",
    month: now.toLocaleDateString("en-AE", { month: "long", year: "numeric" }),
    date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
    dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-05`,
    amountAED: data.package.retainerAED,
    vatAED: Math.round(data.package.retainerAED * 0.05),
    totalAED: Math.round(data.package.retainerAED * 1.05),
    status: "pending",
    pdfUrl: "",
    paidDate: "",
  });

  const [form, setForm] = useState(emptyInvoice());

  const addInvoice = () => {
    if (!form.number.trim()) return;
    const inv: PortalInvoice = { ...form, id: uid() };
    onChange({ ...data, invoices: [...data.invoices, inv] });
    setForm(emptyInvoice());
    setAdding(false);
  };

  const updateStatus = (id: string, status: PortalInvoice["status"]) => {
    onChange({
      ...data,
      invoices: data.invoices.map(i => i.id === id
        ? { ...i, status, paidDate: status === "paid" ? new Date().toISOString().split("T")[0] : i.paidDate }
        : i
      ),
    });
  };

  const deleteInvoice = (id: string) => {
    onChange({ ...data, invoices: data.invoices.filter(i => i.id !== id) });
  };

  const updatePdfUrl = (id: string, url: string) => {
    onChange({ ...data, invoices: data.invoices.map(i => i.id === id ? { ...i, pdfUrl: url } : i) });
  };

  const sorted = [...data.invoices].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-5">
      {!adding && (
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Add Invoice
        </button>
      )}

      {adding && (
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold text-sm">New Invoice</p>
            <button onClick={() => setAdding(false)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Invoice Number</label>
              <input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="e.g. PD/MAY/003" className={inputCls()} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Month</label>
              <input value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} placeholder="e.g. May 2026" className={inputCls()} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Issue Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls()} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={inputCls()} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Amount (AED excl. VAT)</label>
              <input
                type="number"
                value={form.amountAED}
                onChange={e => {
                  const amt = Number(e.target.value);
                  setForm(f => ({ ...f, amountAED: amt, vatAED: Math.round(amt * 0.05), totalAED: Math.round(amt * 1.05) }));
                }}
                className={inputCls()}
              />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Total incl. 5% VAT</label>
              <input value={`AED ${form.totalAED.toLocaleString()}`} readOnly className={`${inputCls()} opacity-50 cursor-default`} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PortalInvoice["status"] }))} className={inputCls("appearance-none")}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">PDF Link (optional)</label>
              <input value={form.pdfUrl ?? ""} onChange={e => setForm(f => ({ ...f, pdfUrl: e.target.value }))} placeholder="Drive / Dropbox PDF link" className={inputCls()} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={addInvoice} disabled={!form.number.trim()} className="bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Add Invoice</button>
            <button onClick={() => setAdding(false)} className="bg-[#1a1a1a] border border-[#2a2a2a] text-white font-medium px-5 py-2.5 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !adding && (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-10 text-center">
          <FileText className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No invoices yet. Add invoice records to show the client their payment history.</p>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map(inv => (
          <div key={inv.id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white text-sm font-medium">{inv.month}</p>
                <span className="text-[#444] text-xs font-mono">{inv.number}</span>
              </div>
              <p className="text-[#555] text-xs mt-0.5">AED {inv.totalAED.toLocaleString()} incl. VAT</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={inv.status}
                onChange={e => updateStatus(inv.id, e.target.value as PortalInvoice["status"])}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[#3a3a3a] appearance-none"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <input
                placeholder="PDF URL"
                defaultValue={inv.pdfUrl ?? ""}
                onBlur={e => updatePdfUrl(inv.id, e.target.value)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[#3a3a3a] w-32 hidden sm:block"
              />
              <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Portal Access section ────────────────────────────────────────────────────

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-0.5">{label}</p>
        <p className="text-white text-sm font-mono truncate">{value}</p>
      </div>
      <button onClick={copy} className="text-[#555] hover:text-green-400 transition-colors flex-shrink-0">
        {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

function PortalAccessSection({ slug, portalUrl }: { slug: string; portalUrl: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ email: string; password: string; url: string } | null>(null);

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${portalUrl}` : portalUrl;

  const create = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, slug }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to create login"); return; }
      setDone({ email: email.trim(), password, url: fullUrl + "/login" });
      setOpen(false);
      setEmail("");
      setPassword("");
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#555] text-xs uppercase tracking-wide font-semibold">Portal Login Access</p>
          <p className="text-[#444] text-xs mt-1">Create credentials to hand off to the client — they never touch Supabase.</p>
        </div>
        <button
          onClick={() => { setOpen(true); setDone(null); setError(""); }}
          className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 text-green-400 font-medium px-4 py-2 rounded-xl text-sm transition-all flex-shrink-0"
        >
          <KeyRound className="w-4 h-4" />
          Create Login
        </button>
      </div>

      {done && (
        <div className="space-y-2 pt-1">
          <p className="text-green-400 text-xs font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Login created — share these details with the client
          </p>
          <CopyRow label="Login URL" value={done.url} />
          <CopyRow label="Email" value={done.email} />
          <CopyRow label="Password" value={done.password} />
          <p className="text-[#444] text-xs text-center pt-1">Send all three to your client on WhatsApp</p>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 space-y-5 fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold">Create Portal Login</h3>
                <p className="text-[#555] text-sm mt-0.5">You set the password — no invite email is sent.</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#555] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Client Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="raveena@petsdelight.com"
                  autoFocus
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-[#3a3a3a] outline-none"
                />
              </div>
              <div>
                <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Choose a password for them"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-[#444] focus:border-[#3a3a3a] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={create}
                disabled={loading || !email.trim() || !password.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {loading ? "Creating…" : "Create Login"}
              </button>
              <button onClick={() => setOpen(false)} className="px-4 py-3 text-[#666] hover:text-white text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

function SettingsTab({ data, onChange, slug, portalUrl }: { data: PortalData; onChange: (d: PortalData) => void; slug: string; portalUrl: string }) {
  const [form, setForm] = useState({ ...data });

  return (
    <div className="space-y-5">
      <PortalAccessSection slug={slug} portalUrl={portalUrl} />
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 space-y-4">
        <p className="text-[#555] text-xs uppercase tracking-wide font-semibold">Portal Settings</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Client Name</label>
            <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} className={inputCls()} />
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Monthly Video Quota</label>
            <input type="number" value={form.monthlyVideoQuota} onChange={e => setForm(f => ({ ...f, monthlyVideoQuota: Number(e.target.value) }))} className={inputCls()} />
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Agency WhatsApp</label>
            <input value={form.agencyWhatsApp} onChange={e => setForm(f => ({ ...f, agencyWhatsApp: e.target.value }))} placeholder="+971..." className={inputCls()} />
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Client Logo URL</label>
            <input value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="/logo-pets-delight.jpg or https://..." className={inputCls()} />
          </div>
        </div>
        <div className="border-t border-[#1a1a1a] pt-4">
          <p className="text-[#555] text-xs uppercase tracking-wide font-semibold mb-3">Package</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Package Name</label>
              <input value={form.package.name} onChange={e => setForm(f => ({ ...f, package: { ...f.package, name: e.target.value } }))} className={inputCls()} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Monthly Retainer (AED)</label>
              <input type="number" value={form.package.retainerAED} onChange={e => setForm(f => ({ ...f, package: { ...f.package, retainerAED: Number(e.target.value) } }))} className={inputCls()} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Start Date</label>
              <input type="date" value={form.package.startDate} onChange={e => setForm(f => ({ ...f, package: { ...f.package, startDate: e.target.value } }))} className={inputCls()} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Contract Duration (months)</label>
              <input type="number" value={form.package.contractMonths ?? ""} onChange={e => setForm(f => ({ ...f, package: { ...f.package, contractMonths: Number(e.target.value) } }))} className={inputCls()} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Account Manager Name</label>
              <input value={form.package.primaryContactName ?? ""} onChange={e => setForm(f => ({ ...f, package: { ...f.package, primaryContactName: e.target.value } }))} className={inputCls()} />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Account Manager WhatsApp</label>
              <input value={form.package.primaryContactWhatsApp ?? ""} onChange={e => setForm(f => ({ ...f, package: { ...f.package, primaryContactWhatsApp: e.target.value } }))} placeholder="+971..." className={inputCls()} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Services (one per line)</label>
              <textarea
                value={form.package.services.join("\n")}
                onChange={e => setForm(f => ({ ...f, package: { ...f.package, services: e.target.value.split("\n") } }))}
                rows={5}
                className={inputCls("resize-none")}
              />
            </div>
          </div>
        </div>
        <button
          onClick={() => onChange(form)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          Apply Settings
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface PortalManagementProps {
  /** The client ID — matches client.id from the clients list */
  clientId: string;
  /** Pre-resolved slug (lowercased, dashed). If omitted, derived from clientId via localStorage lookup. */
  slug?: string;
  /** Called when the user wants to close the portal view */
  onClose: () => void;
  /** Hide the back/close header button (useful when embedded in a route with its own nav) */
  hideCloseButton?: boolean;
}

export default function PortalManagement({ clientId, slug: slugProp, onClose, hideCloseButton }: PortalManagementProps) {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>("content");
  const [slug, setSlug] = useState<string>(slugProp ?? "");

  // Derive slug from localStorage clients if not provided
  useEffect(() => {
    if (slugProp) { setSlug(slugProp); return; }
    if (!clientId) return;
    try {
      const raw = localStorage.getItem("cactus-clients");
      if (raw) {
        const clients = JSON.parse(raw) as { id: string; name: string }[];
        const found = clients.find(c => c.id === clientId);
        if (found) {
          const derivedSlug = found.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          setSlug(derivedSlug);
          return;
        }
      }
    } catch {}
    setSlug(clientId);
  }, [clientId, slugProp]);

  // Fetch portal data once we know the slug
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/portal/admin/${slug}`)
      .then(async r => {
        if (r.ok) return r.json();
        const seed = PORTAL_SEEDS[slug];
        return seed ?? null;
      })
      .then(d => { if (d) setData(d as PortalData); })
      .finally(() => setLoading(false));
  }, [slug]);

  const save = useCallback(async (updated: PortalData) => {
    setSaving(true);
    try {
      const r = await fetch(`/api/portal/admin/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (r.ok) {
        setData(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setData(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }, [slug]);

  if (loading || !slug) {
    return (
      <div className="space-y-4 fade-in">
        <div className="h-10 skeleton rounded-xl w-48" />
        <div className="h-32 skeleton rounded-2xl" />
        <div className="h-48 skeleton rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 fade-in">
        {!hideCloseButton && (
          <button onClick={onClose} className="flex items-center gap-2 text-[#555] hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </button>
        )}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <Package className="w-10 h-10 text-[#333] mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">Portal not found</p>
          <p className="text-[#666] text-sm">Could not load portal data for &quot;{clientId}&quot;.</p>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "content", label: "Content", icon: <PlayCircle className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "invoices", label: "Invoices", icon: <FileText className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Package className="w-4 h-4" /> },
  ];

  const portalUrl = `/portal/${slug}`;
  const fullPortalUrl = typeof window !== "undefined" ? `${window.location.origin}${portalUrl}` : portalUrl;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {!hideCloseButton && (
            <button onClick={onClose} className="flex items-center gap-2 text-[#555] hover:text-white text-sm transition-colors mb-3">
              <ArrowLeft className="w-4 h-4" />
              Back to Clients
            </button>
          )}
          <h1 className="text-white text-2xl font-bold">{data.clientName} — Portal</h1>
          <p className="text-[#555] mt-1 text-sm">Manage what your client sees in their portal</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] text-[#888] hover:text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Preview Portal
          </a>
          <button
            onClick={() => save(data)}
            disabled={saving}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-60 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Portal URL */}
      <div className="flex items-center gap-3 bg-[#111] border border-[#1e1e1e] rounded-xl px-4 py-3">
        <span className="text-[#555] text-xs uppercase tracking-wide font-medium flex-shrink-0">Portal URL</span>
        <code className="text-green-400 text-sm font-mono flex-1 truncate">{fullPortalUrl}</code>
        <button
          onClick={() => navigator.clipboard.writeText(fullPortalUrl)}
          className="text-[#555] hover:text-white text-xs transition-colors flex-shrink-0"
        >
          Copy
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111] border border-[#1e1e1e] rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-[#1a1a1a] text-white border border-[#2a2a2a]"
                : "text-[#666] hover:text-[#aaa]"
            }`}
          >
            {t.icon}
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "content" && <ContentTab data={data} onChange={d => { setData(d); save(d); }} />}
      {tab === "analytics" && <AnalyticsTab data={data} onChange={d => { setData(d); save(d); }} />}
      {tab === "invoices" && <InvoicesTab data={data} onChange={d => { setData(d); save(d); }} />}
      {tab === "settings" && <SettingsTab data={data} onChange={d => { setData(d); save(d); }} slug={slug} portalUrl={portalUrl} />}
    </div>
  );
}
