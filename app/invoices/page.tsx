"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Printer, ArrowLeft, Receipt, Send, X, Zap, ChevronLeft, ChevronRight } from "lucide-react";

interface LineItem {
  id: number;
  desc: string;
  qty: number;
  rate: number;
  notes: string;
  type?: "retainer" | "one-time" | "addon";
  period?: string;
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

function getNextSeqNum(prefix: string): string {
  const key = `cactus-invoice-seq-${prefix.toUpperCase()}`;
  const last = localStorage.getItem(key);
  if (!last) return "001";
  return String(parseInt(last, 10) + 1).padStart(3, "0");
}

function saveSeqNum(prefix: string, seq: string) {
  localStorage.setItem(`cactus-invoice-seq-${prefix.toUpperCase()}`, seq);
}

const MONTH_NAMES = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
function pad2(n: number) { return String(n).padStart(2, "0"); }

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
  discount: number;
  paymentDetails: string;
  notes: string;
  paymentTerms: string;
  terms: string;
}

interface ReceiptData {
  refNumber: string;
  date: string;
  clientName: string;
  amountPaid: number;
  paymentMethod: string;
  paymentType: string;
  notes: string;
}

type DocMode = "quick" | "invoice" | "receipt";

interface QuickClient {
  id: string;
  name: string;
  billToCompany?: string;
  billToAddress?: string;
  billToTrn?: string;
  contactName?: string;
  billingContactName?: string;
  contactWhatsApp?: string;
  contactEmail?: string;
  retainerAED?: number;
  discountedRate?: number;
  fullRateDate?: string;
  invoiceEmails?: string;
  invoiceCc?: string;
  invoicePrefix?: string;
  invoiceDesc?: string;
  invoiceNotes?: string;
  logoUrl?: string;
}

function isClientOnDiscount(client: QuickClient): boolean {
  return !!(
    client.discountedRate && client.discountedRate > 0 &&
    client.fullRateDate &&
    new Date() < new Date(client.fullRateDate + "T00:00:00")
  );
}

function clientEffectiveRate(client: QuickClient): number {
  return isClientOnDiscount(client) ? client.discountedRate! : (client.retainerAED || 0);
}

export default function InvoicesPage() {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 7);

  const [docMode, setDocMode] = useState<DocMode>("quick");
  const [view, setView] = useState<"editor" | "invoice" | "receiptView">("editor");

  // Invoice state
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, desc: "Social media management — short-form video package (15 videos/month)", qty: 1, rate: 0, notes: "", type: "retainer", period: "" },
  ]);
  const [form, setForm] = useState({
    number: "",
    date: fmt(today),
    due: fmt(dueDate),
    clientName: "",
    clientContact: "",
    clientAddress: "",
    clientTrn: "",
    vatRate: 0,
    discount: 0,
    paymentDetails: DEFAULT_PAYMENT_DETAILS,
    notes: "",
    paymentTerms: "",
    terms: "",
  });
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  // Receipt state
  const [receiptForm, setReceiptForm] = useState({
    refNumber: "",
    date: fmt(today),
    clientName: "",
    amountPaid: "",
    paymentMethod: "Bank Transfer",
    paymentType: "Full Payment",
    notes: "",
  });
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const [savedClients, setSavedClients] = useState<QuickClient[]>([]);
  const [quickYear, setQuickYear] = useState(new Date().getFullYear());
  const [currentClient, setCurrentClient] = useState<QuickClient | null>(null);
  const [sendModal, setSendModal] = useState({ show: false, to: "", cc: "", contactName: "", messageBody: "", sending: false, sent: false, error: "" });

  const buildMessageTemplate = (contactName: string, invoiceDate: string) => {
    const d = new Date(invoiceDate + "T00:00:00");
    const year = d.getFullYear();
    const month = d.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const pad = (n: number) => String(n).padStart(2, "0");
    const start = `${pad(1)}/${pad(month + 1)}/${year}`;
    const end = `${pad(lastDay)}/${pad(month + 1)}/${year}`;
    const greeting = contactName ? `Dear ${contactName},` : "Dear Sir/Madam,";
    return `${greeting}\n\nI hope you're doing well.\n\nPlease find attached the invoice covering ${start} to ${end}. Kindly review and process it at your convenience.\n\nBest regards,\nAwab Sirelkhatim`;
  };

  useEffect(() => {
    const last = localStorage.getItem("cactus-last-invoice-num");
    const next = getNextInvoiceNum(last);
    if (next) setForm(f => ({ ...f, number: next }));

    // Load clients for auto-fill
    try {
      const raw = localStorage.getItem("cactus-clients");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSavedClients(parsed);
      }
    } catch {}
  }, []);

  const handleClientAutofill = (clientId: string) => {
    const client = savedClients.find(c => c.id === clientId);
    if (!client) return;
    const contact = [client.contactName, client.contactWhatsApp || client.contactEmail].filter(Boolean).join(" — ");
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const prefix = client.invoicePrefix || derivePrefix(client.name);
    const seq = getNextSeqNum(prefix);
    const invoiceNum = `${prefix}/${MONTH_NAMES[month]}/${seq}`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const terms = `Period of invoice: ${pad2(1)}/${pad2(month + 1)}/${year} to ${pad2(lastDay)}/${pad2(month + 1)}/${year}`;
    setForm(f => ({
      ...f,
      number: invoiceNum,
      terms,
      clientName: client.billToCompany || client.name,
      clientContact: contact,
      clientAddress: client.billToAddress || "",
      clientTrn: client.billToTrn || "",
    }));
    if (client.retainerAED) {
      const desc = client.invoiceDesc || "Social media management — short-form video package";
      setItems([{ id: 1, desc, qty: 1, rate: clientEffectiveRate(client), notes: "", type: "retainer", period: "" }]);
    }
    setCurrentClient(client);
  };

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const discountedSubtotal = subtotal - form.discount;
  const vat = discountedSubtotal * form.vatRate / 100;
  const total = discountedSubtotal + vat;

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), desc: "", qty: 1, rate: 0, notes: "", type: "retainer", period: "" }]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, val: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const SKIP_WORDS = new Set(["and", "the", "of", "a", "an", "or", "&"]);
  function derivePrefix(name: string): string {
    return name.split(" ")
      .filter(w => !SKIP_WORDS.has(w.toLowerCase()))
      .map(w => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  }

  const quickGenerate = (client: QuickClient, month: number, year: number) => {
    const prefix = client.invoicePrefix || derivePrefix(client.name);
    const seq = getNextSeqNum(prefix);
    const invoiceNum = `${prefix}/${MONTH_NAMES[month]}/${seq}`;
    const invoiceDate = new Date(year, month, 1);
    const dueDateObj = new Date(year, month, 8);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const terms = `Period of invoice: ${pad2(1)}/${pad2(month + 1)}/${year} to ${pad2(lastDay)}/${pad2(month + 1)}/${year}`;
    const desc = client.invoiceDesc || "Social media management — short-form video package";
    const rate = clientEffectiveRate(client) || 0;
    const newItems: LineItem[] = [{ id: 1, desc, qty: 1, rate, notes: client.invoiceNotes || "", type: "retainer", period: "" }];
    const data: InvoiceData = {
      number: invoiceNum,
      date: fmt(invoiceDate),
      due: fmt(dueDateObj),
      clientName: client.billToCompany || client.name,
      clientContact: "",
      clientAddress: client.billToAddress || "",
      clientTrn: client.billToTrn || "",
      items: newItems,
      vatRate: 0,
      discount: 0,
      paymentDetails: DEFAULT_PAYMENT_DETAILS,
      notes: "",
      paymentTerms: "",
      terms,
    };
    setForm({
      number: invoiceNum,
      date: fmt(invoiceDate),
      due: fmt(dueDateObj),
      clientName: data.clientName,
      clientContact: "",
      clientAddress: data.clientAddress,
      clientTrn: data.clientTrn,
      vatRate: 0,
      discount: 0,
      paymentDetails: DEFAULT_PAYMENT_DETAILS,
      notes: "",
      paymentTerms: "",
      terms,
    });
    setItems(newItems);
    setInvoiceData(data);
    setCurrentClient(client);
    saveSeqNum(prefix, seq);
    setView("invoice");
    window.scrollTo(0, 0);
  };

  const handleSendInvoice = async () => {
    if (!invoiceData || !sendModal.to.trim()) return;
    setSendModal(m => ({ ...m, sending: true, error: "" }));
    try {
      const res = await fetch("/api/send-invoice-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: sendModal.to, cc: sendModal.cc || undefined, messageBody: sendModal.messageBody || undefined, invoiceData }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send");
      setSendModal(m => ({ ...m, sending: false, sent: true }));
      setTimeout(() => setSendModal({ show: false, to: "", cc: "", contactName: "", messageBody: "", sending: false, sent: false, error: "" }), 2500);
    } catch (err) {
      setSendModal(m => ({ ...m, sending: false, error: err instanceof Error ? err.message : "Failed to send" }));
    }
  };

  const generate = () => {
    if (!form.number || !form.clientName || !form.date || !form.due) {
      alert("Please fill in Invoice Number, Date, Due Date, and Client Name.");
      return;
    }
    localStorage.setItem("cactus-last-invoice-num", form.number);
    setInvoiceData({ ...form, items, vatRate: form.vatRate, discount: form.discount, paymentTerms: form.paymentTerms, terms: form.terms });
    setView("invoice");
    window.scrollTo(0, 0);
  };

  const generateReceipt = () => {
    if (!receiptForm.clientName || !receiptForm.date || !receiptForm.amountPaid) {
      alert("Please fill in Client Name, Date, and Amount Paid.");
      return;
    }
    setReceiptData({
      refNumber: receiptForm.refNumber,
      date: receiptForm.date,
      clientName: receiptForm.clientName || form.clientName,
      amountPaid: parseFloat(receiptForm.amountPaid) || 0,
      paymentMethod: receiptForm.paymentMethod,
      paymentType: receiptForm.paymentType,
      notes: receiptForm.notes,
    });
    setView("receiptView");
    window.scrollTo(0, 0);
  };

  const printStyle = `
    @page { size: A4; margin: 0; }
    @media print {
      html, body { width: 210mm; margin: 0; padding: 0; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body * { visibility: hidden !important; }
      #print-invoice, #print-invoice * { visibility: visible !important; }
      #print-invoice {
        position: absolute !important;
        left: 0 !important; top: 0 !important;
        width: 210mm !important;
        padding: 18mm 20mm !important;
        margin: 0 !important;
        max-width: none !important;
        box-sizing: border-box !important;
        background: white !important;
      }
      .no-print { display: none !important; }
    }
  `;

  // ── Invoice print view ────────────────────────────────────────────────────
  if (view === "invoice" && invoiceData) {
    const sub = invoiceData.items.reduce((s, i) => s + i.qty * i.rate, 0);
    const discAmt = invoiceData.discount || 0;
    const discountedSub = sub - discAmt;
    const vatAmt = discountedSub * invoiceData.vatRate / 100;

    return (
      <>
        <style>{printStyle}</style>

        {/* Controls — hidden on print */}
        <div className="no-print mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setView("editor")}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit Invoice
          </button>
          <button
            onClick={() => {
              const name = currentClient?.billingContactName || currentClient?.contactName || "";
              const msgBody = invoiceData ? buildMessageTemplate(name, invoiceData.date) : "";
              setSendModal({ show: true, to: currentClient?.invoiceEmails || "", cc: currentClient?.invoiceCc || "", contactName: name, messageBody: msgBody, sending: false, sent: false, error: "" });
            }}
            className="flex items-center gap-2 text-sm bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            Send via Email
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>

        {/* Send Invoice Modal */}
        {sendModal.show && (
          <div className="no-print fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-lg">Send Invoice</h2>
                <button onClick={() => setSendModal(m => ({ ...m, show: false }))} className="text-[#555] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              {sendModal.sent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Send className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-white font-semibold">Invoice sent!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#888] text-xs font-medium block mb-1.5">To (comma-separated)</label>
                      <input
                        value={sendModal.to}
                        onChange={e => setSendModal(m => ({ ...m, to: e.target.value }))}
                        placeholder="billing@client.ae"
                        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-green-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-[#888] text-xs font-medium block mb-1.5">CC (optional)</label>
                      <input
                        value={sendModal.cc}
                        onChange={e => setSendModal(m => ({ ...m, cc: e.target.value }))}
                        placeholder="awab@..."
                        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-green-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[#888] text-xs font-medium block mb-1.5">Message body <span className="text-[#555]">(editable)</span></label>
                    <textarea
                      rows={8}
                      value={sendModal.messageBody}
                      onChange={e => setSendModal(m => ({ ...m, messageBody: e.target.value }))}
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-green-500/50 resize-none font-mono text-xs leading-relaxed"
                    />
                    <p className="text-[#444] text-xs mt-1">Invoice is appended automatically below this message.</p>
                  </div>
                  {sendModal.error && <p className="text-red-400 text-xs">{sendModal.error}</p>}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setSendModal(m => ({ ...m, show: false }))}
                      className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendInvoice}
                      disabled={!sendModal.to.trim() || sendModal.sending}
                      className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {sendModal.sending ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Sending…</> : <><Send className="w-4 h-4" />Send Invoice</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
              {invoiceData.clientTrn && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>TRN number: {invoiceData.clientTrn}</div>}
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
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span>{item.desc || "—"}</span>
                      {item.type && item.type !== "retainer" && (
                        <span style={{ fontSize: 10, color: "#6b7280", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 4, padding: "1px 6px", fontWeight: 500, whiteSpace: "nowrap" }}>
                          {item.type === "one-time" ? "One-time" : "Add-on"}
                        </span>
                      )}
                    </div>
                    {item.period && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{item.period}</div>}
                    {item.notes && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{item.notes.split("\n").map((l, idx) => <span key={idx}>{l}{idx < item.notes.split("\n").length - 1 && <br />}</span>)}</div>}
                  </td>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb", textAlign: "right" }}>{item.qty}</td>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb", textAlign: "right", whiteSpace: "nowrap" }}>{aed(item.rate)}</td>
                  <td style={{ padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #e5e7eb", textAlign: "right", whiteSpace: "nowrap" }}>{aed(item.qty * item.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
            <div style={{ minWidth: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" }}>
                <span style={{ color: "#6b7280" }}>Subtotal</span>
                <span>{aed(sub)}</span>
              </div>
              {discAmt > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" }}>
                  <span style={{ color: "#6b7280" }}>Discount</span>
                  <span style={{ color: "#dc2626" }}>-{aed(discAmt)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" }}>
                <span style={{ color: "#6b7280" }}>Tax ({invoiceData.vatRate}%)</span>
                <span>{aed(vatAmt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, padding: "10px 0 5px", borderTop: "1.5px solid #111", marginTop: 6 }}>
                <span style={{ color: "#111" }}>Total</span>
                <span>{aed(discountedSub + vatAmt)}</span>
              </div>
            </div>
          </div>

          {/* Notes + Terms */}
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
            {invoiceData.paymentDetails && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>{invoiceData.paymentDetails.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</div>
              </div>
            )}
            {invoiceData.notes && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>{invoiceData.notes}</div>
              </div>
            )}
            {invoiceData.paymentTerms && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Payment Terms</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{invoiceData.paymentTerms}</div>
              </div>
            )}
            {invoiceData.terms && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Terms</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{invoiceData.terms}</div>
              </div>
            )}
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
              <span style={{ color: "#6b7280", fontWeight: 600 }}>Payment Type</span>
              <span style={{ fontWeight: 600 }}>{receiptData.paymentType}</span>
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
        {(["quick", "invoice", "receipt"] as DocMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setDocMode(mode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              docMode === mode
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "text-[#666] hover:text-white"
            }`}
          >
            {mode === "quick" && <Zap className="w-3.5 h-3.5" />}
            {mode === "quick" ? "Quick Generate" : mode === "invoice" ? "Invoice" : "Receipt"}
          </button>
        ))}
      </div>

      {/* ── QUICK GENERATE ── */}
      {docMode === "quick" && (
        <div className="max-w-3xl space-y-5">
          {/* Year nav */}
          <div className="flex items-center gap-3">
            <button onClick={() => setQuickYear(y => y - 1)} className="p-1.5 text-[#555] hover:text-white border border-[#2a2a2a] hover:border-[#444] rounded-lg transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white font-semibold text-lg w-16 text-center">{quickYear}</span>
            <button onClick={() => setQuickYear(y => y + 1)} className="p-1.5 text-[#555] hover:text-white border border-[#2a2a2a] hover:border-[#444] rounded-lg transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {savedClients.length === 0 ? (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-10 text-center">
              <Zap className="w-7 h-7 text-[#333] mx-auto mb-3" />
              <p className="text-[#555] text-sm">No clients yet — add clients in the Clients section to use Quick Generate.</p>
            </div>
          ) : (
            savedClients.map(client => {
              const now = new Date();
              return (
                <div key={client.id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-sm font-bold text-green-400 flex-shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm">{client.name}</p>
                      {client.billToCompany && client.billToCompany !== client.name && (
                        <p className="text-[#555] text-xs">{client.billToCompany}</p>
                      )}
                    </div>
                    {client.retainerAED && (
                      isClientOnDiscount(client) ? (
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[#555] text-xs line-through">AED {client.retainerAED.toLocaleString()}</span>
                          <span className="text-amber-400 text-sm font-semibold">AED {client.discountedRate!.toLocaleString()}/mo</span>
                        </div>
                      ) : (
                        <span className="ml-auto text-green-400 text-sm font-semibold">AED {client.retainerAED.toLocaleString()}/mo</span>
                      )
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MONTH_SHORT.map((m, i) => {
                      const isPast = (quickYear < now.getFullYear()) || (quickYear === now.getFullYear() && i < now.getMonth());
                      const isCurrent = quickYear === now.getFullYear() && i === now.getMonth();
                      return (
                        <button
                          key={m}
                          onClick={() => quickGenerate(client, i, quickYear)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isCurrent
                              ? "bg-green-500 text-black font-bold"
                              : isPast
                              ? "bg-[#1a1a1a] border border-[#2a2a2a] text-[#555] hover:text-white hover:border-[#444]"
                              : "bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] hover:text-white hover:border-green-500/30 hover:bg-green-500/5"
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                  {!client.invoiceEmails && (
                    <p className="text-[#444] text-xs mt-3">No invoice email set — add one in Clients to enable one-click sending.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

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

          {/* Client auto-fill */}
          {savedClients.length > 0 && (
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 flex items-center gap-4">
              <span className="text-[#555] text-xs uppercase tracking-wider font-semibold flex-shrink-0">Auto-fill Client</span>
              <select
                onChange={e => handleClientAutofill(e.target.value)}
                defaultValue=""
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-green-500/50"
              >
                <option value="" disabled>— Select a client to auto-fill —</option>
                {savedClients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

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
                <div key={item.id} className="space-y-1.5">
                  <div className="grid grid-cols-12 gap-2 items-center">
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
                  {/* Type segmented control */}
                  <div className="flex gap-1">
                    {(["retainer", "one-time", "addon"] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateItem(item.id, "type", t)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                          (item.type ?? "retainer") === t
                            ? "bg-green-500/15 border border-green-500/30 text-green-400"
                            : "bg-[#161616] border border-[#222] text-[#555] hover:text-[#888]"
                        }`}
                      >
                        {t === "retainer" ? "Retainer" : t === "one-time" ? "One-time" : "Add-on"}
                      </button>
                    ))}
                  </div>
                  <input
                    className="w-full bg-[#161616] border border-[#222] rounded-lg px-3 py-1.5 text-xs text-[#777] placeholder-[#444] focus:outline-none focus:border-green-500/30"
                    placeholder="Notes (e.g. 18 videos/month, 15 stories and 8 LinkedIn posts)"
                    value={item.notes}
                    onChange={e => updateItem(item.id, "notes", e.target.value)}
                  />
                  <input
                    className="w-full bg-[#161616] border border-[#222] rounded-lg px-3 py-1.5 text-xs text-[#777] placeholder-[#444] focus:outline-none focus:border-green-500/30"
                    placeholder="Period (optional) — e.g. 18–31 May 2026"
                    value={item.period ?? ""}
                    onChange={e => updateItem(item.id, "period", e.target.value)}
                  />
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
                    Discount (AED)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.discount}
                    onChange={e => setForm(f => ({ ...f, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-24 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-1.5 py-0.5 text-xs text-white text-right focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-[#666] flex items-center gap-1">
                    Tax (
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
                <label className="text-[#555] text-xs block mb-1.5">Payment Details (Notes)</label>
                <textarea
                  rows={5}
                  value={form.paymentDetails}
                  onChange={e => setForm(f => ({ ...f, paymentDetails: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50 resize-none"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[#555] text-xs block mb-1.5">Payment Terms (optional)</label>
                  <input
                    placeholder="e.g. 50% on signing, balance on delivery"
                    value={form.paymentTerms}
                    onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="text-[#555] text-xs block mb-1.5">Terms (billing period)</label>
                  <input
                    placeholder="e.g. Period of invoice: 01/06/2026 to 30/06/2026"
                    value={form.terms}
                    onChange={e => setForm(f => ({ ...f, terms: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-green-500/50"
                  />
                </div>
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
                <label className="text-[#555] text-xs block mb-1.5">Payment Type</label>
                <div className="flex gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1">
                  {["Full Payment", "Partial Payment", "Upfront"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setReceiptForm(f => ({ ...f, paymentType: t }))}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                        receiptForm.paymentType === t
                          ? "bg-green-500/15 border border-green-500/30 text-green-400"
                          : "text-[#555] hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
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
