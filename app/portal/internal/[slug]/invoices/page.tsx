"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Plus, X, Check, Loader2, Trash2, FileText, CheckCircle2, Clock,
  AlertCircle, Printer, ArrowLeft, Zap, ChevronLeft, ChevronRight, RefreshCw, Eye
} from "lucide-react";
import type { Invoice, LineItem } from "@/lib/portal/types";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

interface Company { id: string; name: string; slug: string; retainer_aed: number; email: string | null; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(d: Date) { return d.toISOString().split("T")[0]; }
function fmtDisplay(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function aed(n: number) {
  return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function aedShort(n: number) {
  return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: 0 });
}

const MONTH_NAMES = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function pad2(n: number) { return String(n).padStart(2, "0"); }

const DEFAULT_PAYMENT = `Account Holder: CACTUS LAB FZ LLC\nBank: Mashreq Bank\nAccount Number: 019102102223\nIBAN: AE900330000019102102223`;

const printStyle = `
  @page { size: A4; margin: 0; }
  @media print {
    html, body { width: 210mm; margin: 0; padding: 0; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body * { visibility: hidden !important; }
    #print-invoice, #print-invoice * { visibility: visible !important; }
    #print-invoice {
      position: absolute !important; left: 0 !important; top: 0 !important;
      width: 210mm !important; padding: 18mm 20mm !important; margin: 0 !important;
      max-width: none !important; box-sizing: border-box !important; background: white !important;
    }
    .no-print { display: none !important; }
  }
`;

export default function InvoicesPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";

  const [company, setCompany] = useState<Company|null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Views: "list" | "generator" | "print"
  const [view, setView] = useState<"list"|"generator"|"print">("list");
  const [quickYear, setQuickYear] = useState(new Date().getFullYear());

  // Invoice form state — memoized so refs stay stable across renders.
  // Without this, every render minted a new `today` Date, which cascaded into
  // a fresh `load` callback, refiring the mount effect, retriggering setForm,
  // and looping — the "scrolling up and down + refused to save" bug.
  const today = useMemo(() => new Date(), []);
  const dueDateDefault = useMemo(() => {
    const d = new Date(today); d.setDate(today.getDate() + 7); return d;
  }, [today]);

  const [items, setItems] = useState<(LineItem & { id: number })[]>([
    { id: 1, desc: "Social media management — short-form video package (15 videos/month)", qty: 1, rate: 0, notes: "", type: "retainer" }
  ]);
  const [form, setForm] = useState({
    number: "", date: fmt(today), due: fmt(dueDateDefault),
    clientName: "", clientAddress: "", clientTrn: "",
    vatRate: 0, discount: 0, paymentDetails: DEFAULT_PAYMENT,
    notes: "", paymentTerms: "", terms: "",
  });
  const [printData, setPrintData] = useState<typeof form & { items: typeof items } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string|null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    setRefreshing(true);
    try {
      const coRes = await fetch("/api/portal/v2/companies");
      const companies: Company[] = coRes.ok ? await coRes.json() : [];
      const c = companies.find(x => x.slug === slug);
      setCompany(c ?? null);
      if (c) {
        setForm(f => ({ ...f, clientName: f.clientName || c.name, number: f.number || `CL/${MONTH_NAMES[today.getMonth()]}/001` }));
        setItems(prev => prev.length === 1 && prev[0].rate === 0
          ? [{ id: 1, desc: "Social media management — short-form video package (15 videos/month)", qty: 1, rate: c.retainer_aed, notes: "", type: "retainer" }]
          : prev);
        const invRes = await fetch(`/api/portal/v2/invoices?company_id=${c.id}`);
        setInvoices(invRes.ok ? await invRes.json() : []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug, today]);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const discAmt = form.discount || 0;
  const vatAmt = (subtotal - discAmt) * form.vatRate / 100;
  const total = subtotal - discAmt + vatAmt;

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), desc: "", qty: 1, rate: 0, notes: "", type: "retainer" as const }]);
  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: number, field: string, val: string|number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));

  const quickGenerate = (month: number, year: number) => {
    if (!company) return;
    const invDate = new Date(year, month, 1);
    const dueDate = new Date(year, month, 8);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const num = `CL/${MONTH_NAMES[month]}/${String(invoices.length + 1).padStart(3, "0")}`;
    const terms = `Period of invoice: ${pad2(1)}/${pad2(month+1)}/${year} to ${pad2(lastDay)}/${pad2(month+1)}/${year}`;
    const newItems = [{ id: 1, desc: "Social media management — short-form video package (15 videos/month)", qty: 1, rate: company.retainer_aed, notes: "", type: "retainer" as const }];
    setForm(f => ({ ...f, number: num, date: fmt(invDate), due: fmt(dueDate), terms, discount: 0, vatRate: 0 }));
    setItems(newItems);
    setPrintData({ ...form, number: num, date: fmt(invDate), due: fmt(dueDate), terms, discount: 0, vatRate: 0, items: newItems });
    setView("print");
  };

  const generate = () => {
    if (!form.number || !form.clientName) return;
    setPrintData({ ...form, items });
    setView("print");
  };

  const saveToPortal = async () => {
    if (!company || !printData) return;
    setSaving(true);
    setSaveError(null);
    const sub = printData.items.reduce((s, i) => s + i.qty * i.rate, 0);
    const disc = printData.discount || 0;
    const vat2 = (sub - disc) * printData.vatRate / 100;
    const tot = sub - disc + vat2;
    const monthLabel = new Date(printData.date + "T00:00:00").toLocaleDateString("en-AE", { month: "long", year: "numeric" });

    const res = await fetch("/api/portal/v2/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: company.id,
        invoice_number: printData.number,
        month: monthLabel,
        invoice_date: printData.date,
        due_date: printData.due,
        amount_aed: sub - disc,
        discount_aed: disc,
        total_aed: tot,
        notes: printData.notes || printData.paymentDetails,
        line_items: printData.items.map(({ id: _, ...rest }) => rest),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setSaveError(err.error || `Could not save (${res.status}). If the invoices table doesn't exist yet, run supabase/migrations/001_portal_v2.sql in Supabase.`);
      setSaving(false);
      return;
    }

    const listRes = await fetch(`/api/portal/v2/invoices?company_id=${company.id}`);
    if (listRes.ok) setInvoices(await listRes.json());
    setSaving(false);
    setView("list");
  };

  const markStatus = async (id: string, status: "paid"|"pending"|"overdue") => {
    setSaveError(null);
    const res = await fetch(`/api/portal/v2/invoices/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    if (res.ok) { const updated: Invoice = await res.json(); setInvoices(prev => prev.map(i => i.id === id ? updated : i)); }
    else { const err = await res.json().catch(() => ({})); setSaveError(err.error || `Could not update (${res.status})`); }
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    const res = await fetch(`/api/portal/v2/invoices/${id}`, { method: "DELETE" });
    if (res.ok) setInvoices(prev => prev.filter(i => i.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#333] animate-spin" /></div>;

  // ── PRINT VIEW ──────────────────────────────────────────────────────────────
  if (view === "print" && printData) {
    const sub2 = printData.items.reduce((s, i) => s + i.qty * i.rate, 0);
    const disc2 = printData.discount || 0;
    const vat2 = (sub2 - disc2) * printData.vatRate / 100;
    const tot2 = sub2 - disc2 + vat2;

    return (
      <>
        <style>{printStyle}</style>
        <div className="no-print mb-6 flex gap-3 flex-wrap fade-in">
          <button onClick={() => setView("generator")}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-4 py-2 rounded-lg transition-all">
            <ArrowLeft className="w-4 h-4" />Edit
          </button>
          <button onClick={saveToPortal} disabled={saving}
            className="flex items-center gap-2 text-sm bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save to Client Portal
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
            <Printer className="w-4 h-4" />Print / Save PDF
          </button>
        </div>

        {saveError && (
          <p className="no-print mb-4 text-red-400 text-sm bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 whitespace-pre-wrap">
            {saveError}
          </p>
        )}

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div id="print-invoice" className="p-6 sm:p-[60px]" style={{ maxWidth: 760, margin: "0 auto", background: "#fff", color: "#111", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1D9E75", letterSpacing: -0.3 }}>CACTUS LAB</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Short-form video &amp; social media agency</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 10, lineHeight: 1.7 }}>
                Cactus Lab FZ LLC<br />Ras Al Khaimah Economic Zone (RAKEZ)<br />United Arab Emirates<br />hello@cactuslab.ae
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6, fontWeight: 600 }}>TRN: 105428032400001</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>INVOICE</div>
              <table style={{ marginTop: 12, marginLeft: "auto", fontSize: 12, borderCollapse: "collapse" }}>
                <tbody>
                  <tr><td style={{ padding: "2px 0 2px 16px", fontWeight: 600 }}>Invoice No.</td><td style={{ padding: "2px 0 2px 16px", color: "#6b7280" }}>{printData.number}</td></tr>
                  <tr><td style={{ padding: "2px 0 2px 16px", fontWeight: 600 }}>Date</td><td style={{ padding: "2px 0 2px 16px", color: "#6b7280" }}>{fmtDisplay(printData.date)}</td></tr>
                  <tr><td style={{ padding: "2px 0 2px 16px", fontWeight: 600 }}>Due Date</td><td style={{ padding: "2px 0 2px 16px", color: "#6b7280" }}>{fmtDisplay(printData.due)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40, padding: "20px 24px", background: "#f9fafb", borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Bill To</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{printData.clientName}</div>
              {printData.clientAddress && <div style={{ fontSize: 13, color: "#6b7280" }}>{printData.clientAddress}</div>}
              {printData.clientTrn && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>TRN: {printData.clientTrn}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>From</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Cactus Lab FZ LLC</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>hello@cactuslab.ae</div>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
            <thead>
              <tr>
                {["Description","Qty","Rate","Amount"].map((h, i) => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: i > 0 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {printData.items.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb" }}>
                    {item.desc || "—"}
                    {item.notes && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{item.notes}</div>}
                  </td>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb", textAlign: "right" }}>{item.qty}</td>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb", textAlign: "right", whiteSpace: "nowrap" }}>{aed(item.rate)}</td>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb", textAlign: "right", whiteSpace: "nowrap" }}>{aed(item.qty * item.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
            <div style={{ minWidth: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" }}>
                <span style={{ color: "#6b7280" }}>Subtotal</span><span>{aed(sub2)}</span>
              </div>
              {disc2 > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" }}>
                  <span style={{ color: "#6b7280" }}>Discount</span><span style={{ color: "#dc2626" }}>-{aed(disc2)}</span>
                </div>
              )}
              {printData.vatRate > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" }}>
                  <span style={{ color: "#6b7280" }}>Tax ({printData.vatRate}%)</span><span>{aed(vat2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, padding: "10px 0 5px", borderTop: "1.5px solid #111", marginTop: 6 }}>
                <span>Total</span><span>{aed(tot2)}</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
            {printData.paymentDetails && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Payment Details</div>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>{printData.paymentDetails.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</div>
              </div>
            )}
            {printData.terms && (
              <div><div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Terms</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{printData.terms}</div></div>
            )}
          </div>
        </div>
        </div>
      </>
    );
  }

  // ── GENERATOR VIEW ──────────────────────────────────────────────────────────
  if (view === "generator") {
    return (
      <div className="space-y-5 fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="text-[#555] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white text-2xl font-bold">Invoice Generator</h1>
        </div>

        {/* Quick Generate */}
        {company && (
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-4 h-4 text-green-400" />
              <p className="text-white font-semibold text-sm">Quick Generate</p>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setQuickYear(y => y-1)} className="p-1 text-[#555] hover:text-white border border-[#2a2a2a] rounded-lg transition-all"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-white text-sm font-semibold w-12 text-center">{quickYear}</span>
                <button onClick={() => setQuickYear(y => y+1)} className="p-1 text-[#555] hover:text-white border border-[#2a2a2a] rounded-lg transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {MONTH_SHORT.map((m, i) => {
                const now = new Date();
                const isCurrent = quickYear === now.getFullYear() && i === now.getMonth();
                return (
                  <button key={m} onClick={() => quickGenerate(i, quickYear)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isCurrent ? "bg-green-500 text-black font-bold" : "bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] hover:text-white hover:border-green-500/30"
                    }`}>{m}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Manual form */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 space-y-4">
          <p className="text-[#555] text-xs uppercase tracking-wider font-semibold">Manual Invoice</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[{ label: "Invoice Number", key: "number", type: "text" }, { label: "Date", key: "date", type: "date" }, { label: "Due Date", key: "due", type: "date" }].map(f => (
              <div key={f.key}>
                <label className="text-[#555] text-xs block mb-1.5">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form] as string}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50" />
              </div>
            ))}
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Client Name</label>
              <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Client Address</label>
              <input value={form.clientAddress} onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))}
                placeholder="Dubai, UAE"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-green-500/50" />
            </div>
            <div>
              <label className="text-[#555] text-xs block mb-1.5">Client TRN</label>
              <input value={form.clientTrn} onChange={e => setForm(f => ({ ...f, clientTrn: e.target.value }))}
                placeholder="optional"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-green-500/50" />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] text-[#555] uppercase tracking-wider px-1 mb-1">
              <span className="col-span-6">Description</span><span className="col-span-2">Qty</span><span className="col-span-3">Rate (AED)</span>
            </div>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center mb-2">
                <input className="col-span-12 sm:col-span-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
                  value={item.desc} onChange={e => updateItem(item.id, "desc", e.target.value)} placeholder="Description" />
                <input type="number" inputMode="decimal" placeholder="Qty"
                  className="col-span-4 sm:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white text-right focus:outline-none placeholder-[#555]"
                  value={item.qty} onChange={e => updateItem(item.id, "qty", parseFloat(e.target.value)||0)} />
                <input type="number" inputMode="decimal" placeholder="Rate"
                  className="col-span-6 sm:col-span-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white text-right focus:outline-none placeholder-[#555]"
                  value={item.rate} onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value)||0)} />
                <button onClick={() => removeItem(item.id)} className="col-span-2 sm:col-span-1 text-[#444] hover:text-red-400 transition-colors flex justify-center py-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all">
              <Plus className="w-3.5 h-3.5" />Add line item
            </button>
            <div className="flex justify-end mt-4">
              <div className="min-w-[200px] space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-[#666]">Subtotal</span><span className="text-white">{aed(subtotal)}</span></div>
                <div className="flex justify-between text-sm border-t border-[#2a2a2a] pt-2 font-bold">
                  <span className="text-white">Total</span><span className="text-white">{aed(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[#555] text-xs block mb-1.5">Terms (billing period)</label>
            <input value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))}
              placeholder="Period: 01/06/2026 to 30/06/2026"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-green-500/50" />
          </div>

          <button onClick={generate} disabled={!form.number || !form.clientName}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
            <Printer className="w-4 h-4" />Generate Invoice
          </button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ───────────────────────────────────────────────────────────────
  const unpaid = invoices.filter(i => i.status !== "paid");
  const paidInvoices = invoices.filter(i => i.status === "paid");

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-white text-2xl font-bold truncate">{company?.name ?? slug} — Invoices</h1>
          <p className="text-[#555] text-sm mt-1">Generate, track, and manage invoices.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {company && (
            <a href={`/portal/client/${company.slug}/billing`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all">
              <Eye className="w-3.5 h-3.5" />View as Client
            </a>
          )}
          <button onClick={() => void load()} disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setView("generator")}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" />New Invoice
          </button>
        </div>
      </div>

      {saveError && (
        <p className="text-red-400 text-sm bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3 whitespace-pre-wrap">
          {saveError}
        </p>
      )}

      {/* Summary */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-1">Outstanding</p>
            <p className={`text-xl font-bold ${unpaid.length > 0 ? "text-amber-400" : "text-white"}`}>
              {aedShort(unpaid.reduce((s, i) => s + i.total_aed, 0))}
            </p>
            <p className="text-[#555] text-xs mt-1">{unpaid.length} unpaid</p>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-1">Collected</p>
            <p className="text-green-400 text-xl font-bold">{aedShort(paidInvoices.reduce((s, i) => s + i.total_aed, 0))}</p>
            <p className="text-[#555] text-xs mt-1">{paidInvoices.length} paid</p>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <FileText className="w-8 h-8 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No invoices yet. Generate the first one above.</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
          {invoices.map((inv, i) => (
            <div key={inv.id} className={`flex items-center gap-4 px-5 py-4 ${i < invoices.length-1 ? "border-b border-[#141414]" : ""}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                inv.status === "paid" ? "bg-green-500/10" : inv.status === "overdue" ? "bg-red-500/10" : "bg-amber-500/10"
              }`}>
                {inv.status === "paid" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                 inv.status === "overdue" ? <AlertCircle className="w-4 h-4 text-red-400" /> :
                 <Clock className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white text-sm font-medium">{inv.month}</p>
                  <span className="text-[#444] text-xs font-mono">{inv.invoice_number}</span>
                </div>
                <p className="text-[#555] text-xs mt-0.5">
                  Issued {fmtDisplay(inv.invoice_date)} · Due {fmtDisplay(inv.due_date)}
                  {inv.paid_date && ` · Paid ${fmtDisplay(inv.paid_date)}`}
                </p>
              </div>
              <p className="text-white text-sm font-bold flex-shrink-0">{aedShort(inv.total_aed)}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                {inv.status !== "paid" && (
                  <button onClick={() => markStatus(inv.id, "paid")}
                    className="flex items-center gap-1 text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1.5 rounded-lg hover:bg-green-500/15 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5" />Mark Paid
                  </button>
                )}
                {inv.status === "paid" && (
                  <button onClick={() => markStatus(inv.id, "pending")}
                    className="text-xs text-[#555] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-2.5 py-1.5 rounded-lg transition-colors">
                    Unmark
                  </button>
                )}
                <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
