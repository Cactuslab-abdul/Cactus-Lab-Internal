"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus, X, CheckCircle2, Clock, Mail, Send } from "lucide-react";

interface Payment {
  id: string;
  clientName: string;
  clientEmail: string;
  invoiceRef: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid";
  paidDate?: string;
  notes: string;
}

const STORAGE_KEY = "cactus-payments";

function fmt(d: Date) { return d.toISOString().split("T")[0]; }
function fmtDisplay(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" });
}
function aed(n: number) {
  return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: 0 });
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [ccEmail, setCcEmail] = useState("");
  const [defaultCc, setDefaultCc] = useState("");
  const [editingCc, setEditingCc] = useState(false);
  const [ccDraft, setCcDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [savedClients, setSavedClients] = useState<Array<{ id: string; name: string; contactEmail?: string; retainerAED?: number }>>([]);

  // Add form state
  const [newPayment, setNewPayment] = useState({
    clientName: "",
    clientEmail: "",
    invoiceRef: "",
    amount: "",
    dueDate: fmt(new Date()),
    notes: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPayments(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem("cactus-clients");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSavedClients(parsed);
      }
    } catch {}
    const savedCc = localStorage.getItem("cactus-payments-cc") || "";
    setDefaultCc(savedCc);
    setCcEmail(savedCc);
  }, []);

  const save = (updated: Payment[]) => {
    setPayments(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleClientSelect = (clientId: string) => {
    const client = savedClients.find(c => c.id === clientId);
    if (!client) return;
    setNewPayment(p => ({
      ...p,
      clientName: client.name,
      clientEmail: client.contactEmail || "",
      amount: client.retainerAED ? String(client.retainerAED) : p.amount,
    }));
  };

  const addPayment = () => {
    if (!newPayment.clientName || !newPayment.amount) return;
    const payment: Payment = {
      id: Date.now().toString(),
      clientName: newPayment.clientName,
      clientEmail: newPayment.clientEmail,
      invoiceRef: newPayment.invoiceRef,
      amount: parseFloat(newPayment.amount) || 0,
      dueDate: newPayment.dueDate,
      status: "pending",
      notes: newPayment.notes,
    };
    save([payment, ...payments]);
    setNewPayment({ clientName: "", clientEmail: "", invoiceRef: "", amount: "", dueDate: fmt(new Date()), notes: "" });
    setShowAdd(false);
  };

  const confirmMarkPaid = async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    setSending(true);
    try {
      if (payment.clientEmail) {
        const body = `Dear ${payment.clientName},\n\nWe're writing to confirm that we have received your payment of ${aed(payment.amount)}${payment.invoiceRef ? ` for Invoice ${payment.invoiceRef}` : ""}.\n\nThank you for your continued partnership with Cactus Lab. We look forward to delivering exceptional content for your brand.\n\nBest regards,\nAwab Sirelkhatim\nCactus Lab FZ LLC\nhello@cactuslab.ae`;

        const res = await fetch("/api/send-payment-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: payment.clientEmail,
            cc: ccEmail || undefined,
            clientName: payment.clientName,
            amount: payment.amount,
            invoiceRef: payment.invoiceRef,
            body,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          console.error("Email failed:", err);
        }
      }
    } catch (err) {
      console.error("Send email error:", err);
    }

    save(payments.map(p =>
      p.id === paymentId
        ? { ...p, status: "paid", paidDate: fmt(new Date()) }
        : p
    ));
    setMarkingPaid(null);
    setCcEmail("");
    setSending(false);
  };

  const deletePayment = (id: string) => {
    save(payments.filter(p => p.id !== id));
  };

  const pending = payments.filter(p => p.status === "pending");
  const paid = payments.filter(p => p.status === "paid");
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);
  const totalPaid = paid.reduce((s, p) => s + p.amount, 0);

  const todayStr = fmt(new Date());
  const overdue = pending.filter(p => p.dueDate < todayStr);

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
            <CreditCard className="w-4 h-4" />
            Finance
          </div>
          <h1 className="text-white text-2xl font-bold">Payments</h1>
          <p className="text-[#666] mt-1">Track client payments and send automated confirmations</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Payment
        </button>
      </div>

      {/* Default CC email setting */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4 flex items-center gap-3">
        <Mail className="w-4 h-4 text-[#555] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[#555] text-xs uppercase tracking-wide font-medium mr-2">Default CC</span>
          {editingCc ? (
            <input
              value={ccDraft}
              onChange={e => setCcDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  setDefaultCc(ccDraft);
                  setCcEmail(ccDraft);
                  localStorage.setItem("cactus-payments-cc", ccDraft);
                  setEditingCc(false);
                }
                if (e.key === "Escape") { setCcDraft(defaultCc); setEditingCc(false); }
              }}
              placeholder="e.g. awab.sirelkhatim@gmail.com"
              autoFocus
              className="bg-[#1a1a1a] border border-green-500/40 rounded-lg px-3 py-1 text-sm text-white placeholder-[#444] focus:outline-none w-72"
            />
          ) : (
            <span className="text-sm text-white">{defaultCc || <span className="text-[#444]">Not set</span>}</span>
          )}
        </div>
        {editingCc ? (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => { setDefaultCc(ccDraft); setCcEmail(ccDraft); localStorage.setItem("cactus-payments-cc", ccDraft); setEditingCc(false); }}
              className="bg-green-500 hover:bg-green-400 text-black text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >Save</button>
            <button onClick={() => { setCcDraft(defaultCc); setEditingCc(false); }} className="text-[#555] hover:text-white text-xs px-2 py-1.5 rounded-lg transition-colors">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => { setCcDraft(defaultCc); setEditingCc(true); }}
            className="text-[#555] hover:text-white text-xs border border-[#2a2a2a] hover:border-[#444] px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
          >
            {defaultCc ? "Edit" : "Set CC"}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
          <p className="text-[#666] text-xs font-medium mb-1">Pending</p>
          <p className="text-white text-2xl font-bold">{aed(totalPending)}</p>
          <p className="text-yellow-400 text-xs mt-1">{pending.length} payment{pending.length !== 1 ? "s" : ""}{overdue.length > 0 ? ` · ${overdue.length} overdue` : ""}</p>
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
          <p className="text-[#666] text-xs font-medium mb-1">Collected This Month</p>
          <p className="text-white text-2xl font-bold">{aed(totalPaid)}</p>
          <p className="text-green-400 text-xs mt-1">{paid.length} payment{paid.length !== 1 ? "s" : ""} received</p>
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
          <p className="text-[#666] text-xs font-medium mb-1">Total Tracked</p>
          <p className="text-white text-2xl font-bold">{aed(totalPending + totalPaid)}</p>
          <p className="text-[#555] text-xs mt-1">{payments.length} total records</p>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">New Payment Record</h3>
            <button onClick={() => setShowAdd(false)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {savedClients.length > 0 && (
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Auto-fill from Client</label>
              <select
                onChange={e => handleClientSelect(e.target.value)}
                defaultValue=""
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-green-500/50"
              >
                <option value="" disabled>— Select client —</option>
                {savedClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Client Name *</label>
              <input value={newPayment.clientName} onChange={e => setNewPayment(p => ({ ...p, clientName: e.target.value }))}
                placeholder="Pets Delight"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Client Email (for auto-send)</label>
              <input value={newPayment.clientEmail} onChange={e => setNewPayment(p => ({ ...p, clientEmail: e.target.value }))}
                placeholder="client@..."
                type="email"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Invoice Ref</label>
              <input value={newPayment.invoiceRef} onChange={e => setNewPayment(p => ({ ...p, invoiceRef: e.target.value }))}
                placeholder="e.g. PDmay003"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Amount (AED) *</label>
              <input type="number" value={newPayment.amount} onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))}
                placeholder="5500"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Due Date</label>
              <input type="date" value={newPayment.dueDate} onChange={e => setNewPayment(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm focus:border-green-500/50 outline-none" />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">Notes</label>
              <input value={newPayment.notes} onChange={e => setNewPayment(p => ({ ...p, notes: e.target.value }))}
                placeholder="May retainer, etc."
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={addPayment} disabled={!newPayment.clientName || !newPayment.amount}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Add Record
            </button>
            <button onClick={() => setShowAdd(false)}
              className="bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mark paid modal */}
      {markingPaid && (() => {
        const payment = payments.find(p => p.id === markingPaid);
        if (!payment) return null;
        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setMarkingPaid(null)}>
            <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Mark as Paid</h3>
                <button onClick={() => setMarkingPaid(null)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                <p className="text-white font-semibold">{payment.clientName}</p>
                <p className="text-green-400 text-sm font-bold mt-0.5">{aed(payment.amount)}</p>
                {payment.invoiceRef && <p className="text-[#555] text-xs mt-0.5">Invoice: {payment.invoiceRef}</p>}
              </div>

              {payment.clientEmail ? (
                <div>
                  <p className="text-[#888] text-sm mb-2">
                    A payment confirmation will be sent to <span className="text-white">{payment.clientEmail}</span>
                  </p>
                  <label className="text-[#666] text-xs uppercase tracking-wide font-medium block mb-1.5">CC Email (optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                    <input
                      value={ccEmail}
                      onChange={e => setCcEmail(e.target.value)}
                      placeholder="cc@example.com"
                      type="email"
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2.5 text-white text-sm placeholder-[#444] focus:border-green-500/50 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[#666] text-sm">No email set — payment will be marked paid without sending a confirmation.</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setMarkingPaid(null); setCcEmail(defaultCc); }}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={() => confirmMarkPaid(markingPaid)} disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {payment.clientEmail ? "Mark Paid & Send" : "Mark as Paid"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Payments list */}
      {payments.length === 0 && !showAdd ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <CreditCard className="w-10 h-10 text-[#333] mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No payments tracked yet</p>
          <p className="text-[#666] text-sm mb-5">Add your first payment record to start tracking what&apos;s due and what&apos;s been collected.</p>
          <button onClick={() => setShowAdd(true)}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            Add First Record
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h3 className="text-[#555] text-xs font-semibold uppercase tracking-wider mb-3 px-1">Pending ({pending.length})</h3>
              <div className="space-y-2">
                {pending.map(payment => {
                  const isOverdue = payment.dueDate < todayStr;
                  return (
                    <div key={payment.id} className={`bg-[#111] border rounded-2xl p-5 flex items-center gap-4 ${isOverdue ? "border-red-500/20" : "border-[#1e1e1e]"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isOverdue ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
                        <Clock className={`w-4 h-4 ${isOverdue ? "text-red-400" : "text-yellow-400"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold">{payment.clientName}</span>
                          {payment.invoiceRef && <span className="text-[#555] text-xs border border-[#2a2a2a] px-1.5 py-0.5 rounded">{payment.invoiceRef}</span>}
                          {isOverdue && <span className="text-xs text-red-400 font-medium">Overdue</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-green-400 font-bold text-sm">{aed(payment.amount)}</span>
                          <span className="text-[#555] text-xs">Due {fmtDisplay(payment.dueDate)}</span>
                          {payment.notes && <span className="text-[#555] text-xs truncate">· {payment.notes}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => { setMarkingPaid(payment.id); setCcEmail(defaultCc); }}
                          className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Paid
                        </button>
                        <button onClick={() => deletePayment(payment.id)} className="text-[#444] hover:text-red-400 transition-colors p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paid */}
          {paid.length > 0 && (
            <div>
              <h3 className="text-[#555] text-xs font-semibold uppercase tracking-wider mb-3 px-1">Paid ({paid.length})</h3>
              <div className="space-y-2">
                {paid.map(payment => (
                  <div key={payment.id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 flex items-center gap-4 opacity-70">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold">{payment.clientName}</span>
                        {payment.invoiceRef && <span className="text-[#555] text-xs border border-[#2a2a2a] px-1.5 py-0.5 rounded">{payment.invoiceRef}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[#888] font-bold text-sm">{aed(payment.amount)}</span>
                        {payment.paidDate && <span className="text-[#555] text-xs">Paid {fmtDisplay(payment.paidDate)}</span>}
                        {payment.notes && <span className="text-[#555] text-xs truncate">· {payment.notes}</span>}
                      </div>
                    </div>
                    <button onClick={() => deletePayment(payment.id)} className="text-[#333] hover:text-red-400/60 transition-colors p-1 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
