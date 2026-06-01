"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { FileText, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import type { Invoice } from "@/lib/portal/types";
import { useRefreshOnFocus } from "@/lib/portal/useRefresh";

function aed(n: number) {
  return `AED ${Number(n).toLocaleString("en-AE", { minimumFractionDigits: 0 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" });
}

const BANK_DETAILS = `Account Holder: CACTUS LAB FZ LLC
Bank: Mashreq Bank
Account Number: 019102102223
IBAN: AE900330000019102102223`;

export default function BillingPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!slug) return;
    const r = await fetch(`/api/portal/v2/invoices?slug=${slug}`);
    setInvoices(r.ok ? await r.json() : []);
    setLoading(false);
  }, [slug]);

  useEffect(() => { void load(); }, [load]);
  useRefreshOnFocus(load);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#333] animate-spin" /></div>;

  const unpaid = invoices.filter(i => i.status === "pending" || i.status === "overdue");
  const paid = invoices.filter(i => i.status === "paid");
  const totalPaid = paid.reduce((s, i) => s + i.total_aed, 0);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-white text-2xl font-bold">Billing</h1>
        <p className="text-[#555] text-sm mt-1">Your invoice history and payment details.</p>
      </div>

      {/* Outstanding banner */}
      {unpaid.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-semibold text-sm mb-1">
                {aed(unpaid.reduce((s, i) => s + i.total_aed, 0))} outstanding
              </p>
              <p className="text-[#888] text-sm mb-3">Please transfer to the account below and let your account manager know once sent.</p>
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 font-mono text-xs text-[#aaa] whitespace-pre-line leading-relaxed">
                {BANK_DETAILS}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-2">Total Paid</p>
            <p className="text-green-400 text-xl font-bold">{aed(totalPaid)}</p>
            <p className="text-[#555] text-xs mt-1">{paid.length} invoice{paid.length !== 1 ? "s" : ""} paid</p>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
            <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-2">Outstanding</p>
            <p className={`text-xl font-bold ${unpaid.length > 0 ? "text-amber-400" : "text-white"}`}>
              {aed(unpaid.reduce((s, i) => s + i.total_aed, 0))}
            </p>
            <p className="text-[#555] text-xs mt-1">{unpaid.length} unpaid</p>
          </div>
        </div>
      )}

      {/* Invoice ledger */}
      {invoices.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-16 text-center">
          <FileText className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-[#555] text-sm">No invoices yet.</p>
        </div>
      ) : (
        <div>
          <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3">Invoice History</p>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
            {invoices.map((inv, i) => {
              const isUnpaid = inv.status === "pending" || inv.status === "overdue";
              return (
                <div key={inv.id} className={`flex items-center gap-4 px-5 py-4 ${i < invoices.length - 1 ? "border-b border-[#141414]" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    inv.status === "paid" ? "bg-green-500/10" : inv.status === "overdue" ? "bg-red-500/10" : "bg-amber-500/10"
                  }`}>
                    {inv.status === "paid"
                      ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                      : inv.status === "overdue"
                      ? <AlertCircle className="w-4 h-4 text-red-400" />
                      : <Clock className="w-4 h-4 text-amber-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white text-sm font-medium">{inv.month}</p>
                      <span className="text-[#444] text-xs font-mono">{inv.invoice_number}</span>
                    </div>
                    <p className="text-[#555] text-xs mt-0.5">
                      Issued {fmtDate(inv.invoice_date)}
                      {inv.paid_date && ` · Paid ${fmtDate(inv.paid_date)}`}
                      {isUnpaid && ` · Due ${fmtDate(inv.due_date)}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-bold">{aed(inv.total_aed)}</p>
                    <span className={`text-xs font-medium ${
                      inv.status === "paid" ? "text-green-400" :
                      inv.status === "overdue" ? "text-red-400" : "text-amber-400"
                    }`}>
                      {inv.status === "paid" ? "Paid" : inv.status === "overdue" ? "Overdue" : "Pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bank details card */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
        <p className="text-[#555] text-xs uppercase tracking-wide font-medium mb-3">Payment Details</p>
        <div className="font-mono text-sm text-[#aaa] whitespace-pre-line leading-relaxed">{BANK_DETAILS}</div>
        <p className="text-[#444] text-xs mt-3">Please use your company name as the payment reference, then notify your account manager.</p>
      </div>
    </div>
  );
}
