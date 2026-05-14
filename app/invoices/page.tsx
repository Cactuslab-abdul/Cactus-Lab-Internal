"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Printer, ArrowLeft, Receipt } from "lucide-react";

interface LineItem {
  id: number;
  desc: string;
  qty: number;
  rate: number;
}

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

function fmtDisplay(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function aed(n: number) {
  return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getNextInvoiceNum(last: string | null): string | null {
  if (!last) return null;
  const match = last.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const num = parseInt(match[2], 10) + 1;
    const padded = String(num).padStart(match[2].length, "0");
    return prefix + padded;
  }
  return null;
}

const DEFAULT_PAYMENT_DETAILS = `Account Holder: CACTUS LAB FZ LLC
Bank: Mashreq Bank
Account Number: 019102102223
IBAN: AE900330000019102102223`;

interface InvoiceData {
  number: string;
  date: string;
  due: string;
  clientName: string;
  clientContact: string;
  clientAddress: string;
  clientTrn: string;
  items: LineItem[];
  vatRate: number;
  paymentDetails: string;
  notes: string;
}

interface ReceiptData {
  refNumber: string;
  date: string;
  clientName: string;
  amountPaid: number;
  paymentMethod: string;
  notes: string;
}

type DocMode = "invoice" | "receipt";

export default function InvoicesPage() {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 7);

  const [docMode, setDocMode] = useState<DocMode>("invoice");
  const [view, setView] = useState<"editor" | "invoice" | "receiptView">("editor");

  // Invoice state
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, desc: "Social media management — short-form video package (15 videos/month)", qty: 1, rate: 5500 },
  ]);
  const [form, setForm] = useState({
    number: "",
    date: fmt(today),
    due: fmt(dueDate),
    clientName: "",
    clientContact: "",
    clientAddress: "",
    clientTrn: "",
    vatRate: 5,
    paymentDetails: DEFAULT_PAYMENT_DETAILS,
    notes: "",
  });
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  // Receipt state
  const [receiptForm, setReceiptForm] = useState({
    refNumber: "",
    date: fmt(today),
    clientName: "",
    amountPaid: "",
    paymentMethod: "Bank Transfer",
    notes: "",
  });
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const last = localStorage.getItem("cactus-last-invoice-num");
    const next = getNextInvoiceNum(last);
    if (next) setForm(f => ({ ...f, number: next }));
  }, []);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const vat = subtotal * form.vatRate / 100;
  const total = subtotal + vat;

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), desc: "", qty: 1, rate: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, val: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const generate = () => {
    if (!form.number || !form.clientName || !form.date || !form.due) {
      alert("Please fill in Invoice Number, Date, Due Date, and Client Name.");
      return;
    }
    localStorage.setItem("cactus-last-invoice-num", form.number);
    setInvoiceData({ ...form, items, vatRate: form.vatRate });
    setView("invoice");
    window.scrollTo(0, 0);
  };

  const generateReceipt = () => {
    if (!form.clientName || !receiptForm.date || !receiptForm.amountPaid) {
      alert("Please fill in Client Name, Date, and Amount Paid.");
      return;
    }
    setReceiptData({
      refNumber: receiptForm.refNumber,
      date: receiptForm.date,
      clientName: receiptForm.clientName || form.clientName,
      amountPaid: parseFloat(receiptForm.amountPaid) || 0,
      paymentMethod: receiptForm.paymentMethod,
      notes: receiptForm.notes,
    });
    setView("receiptView");
    window.scrollTo(0, 0);
  };

  const printStyle = `
    @media print {
      body * { visibility: hidden !important; }
      #print-invoice, #print-invoice * { visibility: visible !important; }
      #print-invoice {
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 40px !important;
      }
    }
  `;

  // ── Invoice print view ────────────────────────────────────────────────────
  if (view === "invoice" && invoiceData) {
    const sub = invoiceData.items.reduce((s, i) => s + i.qty * i.rate, 0);
    const vatAmt = sub * invoiceData.vatRate / 100;

    return (
      <>
        <style>{printStyle}</style>

        {/* Controls — hidden on print */}
        <div className="no-print mb-6 flex gap-3">
          <button
            onClick={() => setView("editor")}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit Invoice
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>

        {/* Invoice document */}
        <div id="print-invoice" style={{ maxWidth: 760, margin: "0 auto", padding: "60px", background: "#fff", color: "#111", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1D9E75", letterSpacing: -0.3 }}>CACTUS LAB</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Short-form video &amp; social media agency</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 10, lineHeight: 1.7 }}>
                Cactus Lab FZ LLC<br />
                Ras Al Khaimah Economic Zone (RAKEZ)<br />
                United Arab Emirates<br />
                hello@cactuslab.ae
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6, fontWeight: 600 }}>
                TRN: 105428032400001
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>INVOICE</div>
              <table style={{ marginTop: 12, marginLeft: "auto", fontSize: 12, borderCollapse: "collapse" }}>
                <tbody>
                  <tr><td style={{ padding: "2px 0 2px 16px", fontWeight: 600 }}>Invoice No.</td><td style={{ padding: "2px 0 2px 16px", color: "#6b7280" }}>{invoiceData.number}</td></tr>
                  <tr><td style={{ padding: "2px 0 2px 16px", fontWeight: 600 }}>Date</td><td style={{ padding: "2px 0 2px 16px", color: "#6b7280" }}>{fmtDisplay(invoiceData.date)}</td></tr>
                  <tr><td style={{ padding: "2px 0 2px 16px", fontWeight: 600 }}>Due Date</td><td style={{ padding: "2px 0 2px 16px", color: "#6b7280" }}>{fmtDisplay(invoiceData.due)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill to / From */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40, padding: "20px 24px", background: "#f9fafb", borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Bill To</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{invoiceData.clientName}</div>
              {invoiceData.clientContact && <div style={{ fontSize: 13, color: "#6b7280" }}>{invoiceData.clientContact}</div>}
              {invoiceData.clientAddress && <div style={{ fontSize: 13, color: "#6b7280" }}>{invoiceData.clientAddress}</div>}
              {invoiceData.clientTrn && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>TRN: {invoiceData.clientTrn}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>From</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Cactus Lab FZ LLC</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>hello@cactuslab.ae</div>
            </div>
          </div>

          {/* Items table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
            <thead>
              <tr>
                {["Description", "Qty", "Rate", "Amount"].map((h, i) => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: i > 0 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb" }}>{item.desc || "—"}</td>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb", textAlign: "right" }}>{item.qty}</td>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb", textAlign: "right", whiteSpace: "nowrap" }}>{aed(item.rate)}</td>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb", textAlign: "right", whiteSpace: "nowrap" }}>{aed(item.qty * item.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom: payment details + totals */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ maxWidth: 340 }}>
              {invoiceData.paymentDetails && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Payment Details</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>{invoiceData.paymentDetails.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</div>
                </div>
              )}
              {invoiceData.notes && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Notes</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>{invoiceData.notes}</div>
                </div>
              )}
            </div>
            <div style={{ minWidth: 220 }}>
              {[
                { label: "Subtotal", val: aed(sub) },
                { label: `VAT (${invoiceData.vatRate}%)`, val: aed(vatAmt) },
                { label: "Total Due", val: aed(sub + vatAmt), bold: true },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: row.bold ? 17 : 13, fontWeight: row.bold ? 700 : 400, padding: row.bold ? "10px 0 5px" : "5px 0", borderTop: row.bold ? "1.5px solid #111" : "none", marginTop: row.bold ? 6 : 0 }}>
                  <span style={{ color: row.bold ? "#111" : "#6b7280" }}>{row.label}</span>
                  <span>{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 60, paddingTop: 20, borderTop: "1px solid #e5e7eb", textAlign: "center", fontSize: 11, color: "#6b7280" }}>
            Cactus Lab FZ LLC &nbsp;·&nbsp; RAKEZ, UAE &nbsp;·&nbsp; TRN: 105428032400001 &nbsp;·&nbsp; Thank you for your business.
          </div>
        </div>
      </>
    );
  }

  // ── Receipt print view ────────────────────────────────────────────────────
  if (view === "receiptView" && receiptData) {
    return (
      <>
        <style>{printStyle}</style>

        <div className="no-print mb-6 flex gap-3">
          <button
            onClick={() => setView("editor")}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit Receipt
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>

        <div id="print-invoice" style={{ maxWidth: 680, margin: "0 auto", padding: "60px", background: "#fff", color: "#111", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          {/* Receipt header */}
          <div style={{ textAlign: "center", marginBottom: 40, paddingBottom: 28, borderBottom: "2px solid #1D9E75" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1D9E75", letterSpacing: 1, marginBottom: 4 }}>CACTUS LAB</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Short-form video &amp; social media agency</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Cactus Lab FZ LLC · RAKEZ, UAE · hello@cactuslab.ae</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>TRN: 105428032400001</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, marginTop: 24, color: "#111" }}>PAYMENT RECEIPT</div>
            {receiptData.refNumber && (
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Ref: {receiptData.refNumber}</div>
            )}
          </div>

          {/* Receipt body */}
          <div style={{ fontSize: 14, lineHeight: 2, color: "#374151" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>Received From</span>
              <span style={{ fontWeight: 600 }}>{receiptData.clientName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>Amount</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: "#1D9E75" }}>{aed(receiptData.amountPaid)}</span>
            </div>
            {receiptData.notes && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: "#6b7280", fontWeight: 600 }}>For</span>
                <span style={{ maxWidth: 320, textAlign: "right" }}>{receiptData.notes}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>Date</span>
              <span>{fmtDisplay(receiptData.date)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>Payment Method</span>
              <span>{receiptData.paymentMethod}</span>
            </div>
          </div>

          <div style={{ marginTop: 48, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#1D9E75", fontWeight: 600, marginBottom: 4 }}>Thank you for your business!</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Cactus Lab FZ LLC · RAKEZ, UAE · TRN: 105428032400001</div>
          </div>
        </div>
      </>
    );
  }

  // ── Editor ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Invoice &amp; Receipt Generator</h1>
          <p className="text-[#666] mt-1">Fill in the details, then generate and print to PDF</p>
        </div>
      </div>

      {/* Mode switcher */}
      <div className="flex gap-1 bg-[#111] border border-[#1e1e1e] rounded-xl p-1 w-fit">
        {(["invoice", "receipt"] as DocMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setDocMode(mode)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              docMode === mode
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "text-[#666] hover:text-white"
            }`}
          >
            {mode === "invoice" ? "Invoice" : "Receipt"}
          </button>
        ))}
      </div>

      {/* ── INVOICE FORM ── */}
      {docMode === "invoice" && (
        <div className="max-w-3xl space-y-5">
          {/* Invoice details */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <h2 className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-4">Invoice Details</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Invoice Number", key: "number", placeholder: "e.g. PDmay003", type: "text" },
                { label: "Invoice Date", key: "date", placeholder: "", type: "date" },
                { label: "Due Date", key: "due", placeholder: "", type: "date" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[#555] text-xs block mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form] as string}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bill to */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <h2 className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-4">Bill To</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Client / Company Name</label>
                <input
                  placeholder="Pets Delight"
                  value={form.clientName}
                  onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Contact Name (optional)</label>
                <input
                  placeholder="e.g. Mohammed Al Rashidi"
                  value={form.clientContact}
                  onChange={e => setForm(f => ({ ...f, clientContact: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Client Address / Location (optional)</label>
                <input
                  placeholder="e.g. Dubai, UAE"
                  value={form.clientAddress}
                  onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Client TRN (optional)</label>
                <input
                  placeholder="e.g. 100123456700003"
                  value={form.clientTrn}
                  onChange={e => setForm(f => ({ ...f, clientTrn: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <h2 className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-4">Line Items</h2>
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-12 gap-2 text-[10px] text-[#555] uppercase tracking-wider px-1">
                <span className="col-span-6">Description</span>
                <span className="col-span-2">Qty</span>
                <span className="col-span-3">Rate (AED)</span>
                <span className="col-span-1"></span>
              </div>
              {items.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className="col-span-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                    placeholder="Description"
                    value={item.desc}
                    onChange={e => updateItem(item.id, "desc", e.target.value)}
                  />
                  <input
                    type="number"
                    className="col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white text-right focus:outline-none focus:border-green-500/50"
                    value={item.qty}
                    onChange={e => updateItem(item.id, "qty", parseFloat(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    className="col-span-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white text-right focus:outline-none focus:border-green-500/50"
                    value={item.rate}
                    onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                  />
                  <button onClick={() => removeItem(item.id)} className="col-span-1 text-[#444] hover:text-red-400 transition-colors p-1 flex justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add line item
            </button>

            {/* Totals */}
            <div className="flex justify-end mt-5">
              <div className="min-w-[220px] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Subtotal</span>
                  <span className="text-white">{aed(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-[#666] flex items-center gap-1">
                    VAT (
                    <input
                      type="number"
                      value={form.vatRate}
                      onChange={e => setForm(f => ({ ...f, vatRate: parseFloat(e.target.value) || 0 }))}
                      className="w-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-1.5 py-0.5 text-xs text-white text-center focus:outline-none focus:border-green-500/50"
                    />
                    %)
                  </span>
                  <span className="text-white">{aed(vat)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-[#2a2a2a] pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-white">{aed(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Notes */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <h2 className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-4">Payment &amp; Notes</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Payment Details</label>
                <textarea
                  rows={5}
                  value={form.paymentDetails}
                  onChange={e => setForm(f => ({ ...f, paymentDetails: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50 resize-none"
                />
              </div>
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Notes (optional)</label>
                <textarea
                  rows={5}
                  placeholder="e.g. Thank you for your business. Payment due within 7 days."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50 resize-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={generate}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-5 h-5" />
            Generate Invoice
          </button>
        </div>
      )}

      {/* ── RECEIPT FORM ── */}
      {docMode === "receipt" && (
        <div className="max-w-3xl space-y-5">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6">
            <h2 className="text-[#555] text-xs uppercase tracking-wider font-semibold mb-4">Receipt Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Client / Company Name</label>
                <input
                  placeholder="Pets Delight"
                  value={receiptForm.clientName}
                  onChange={e => setReceiptForm(f => ({ ...f, clientName: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Invoice / Reference Number (optional)</label>
                <input
                  placeholder="e.g. PDmay003"
                  value={receiptForm.refNumber}
                  onChange={e => setReceiptForm(f => ({ ...f, refNumber: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Date</label>
                <input
                  type="date"
                  value={receiptForm.date}
                  onChange={e => setReceiptForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Amount Paid (AED)</label>
                <input
                  type="number"
                  placeholder="5500"
                  value={receiptForm.amountPaid}
                  onChange={e => setReceiptForm(f => ({ ...f, amountPaid: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Payment Method</label>
                <select
                  value={receiptForm.paymentMethod}
                  onChange={e => setReceiptForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
                >
                  {["Bank Transfer", "Cash", "Card"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#555] text-xs block mb-1.5">Description / Notes (optional)</label>
                <input
                  placeholder="e.g. May retainer — social media management"
                  value={receiptForm.notes}
                  onChange={e => setReceiptForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>
          </div>

          <button
            onClick={generateReceipt}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 transition-colors"
          >
            <Receipt className="w-5 h-5" />
            Generate Receipt
          </button>
        </div>
      )}
    </div>
  );
}
