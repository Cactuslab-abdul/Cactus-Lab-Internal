import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { normInvoiceRow } from "@/lib/portal/format";
import type { Invoice, Company, LineItem } from "@/lib/portal/types";
import { PrintBar } from "./PrintBar";

export const dynamic = "force-dynamic";

const PAYMENT_DETAILS = `Account Holder: CACTUS LAB FZ LLC
Bank: Mashreq Bank
Account Number: 019102102223
IBAN: AE900330000019102102223`;

function aed(n: number) {
  return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDisplay(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const printStyle = `
  @page { size: A4; margin: 0; }
  @media print {
    html, body { width: 210mm; margin: 0; padding: 0; background: white !important; }
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

export default async function ClientInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const { print } = await searchParams;

  const supabase = createServiceClient();
  const { data: invRow } = await supabase.from("invoices").select("*").eq("id", id).single();
  if (!invRow) notFound();
  const invoice = normInvoiceRow(invRow) as Invoice;

  const { data: company } = await supabase
    .from("companies").select("*").eq("id", invoice.company_id).single() as { data: Company | null };
  if (!company) notFound();

  const subtotal = invoice.line_items.reduce((s: number, i: LineItem) => s + i.qty * i.rate, 0);
  const disc = invoice.discount_aed || 0;
  const total = invoice.total_aed;

  const backHref = `/portal/client/${company.slug}/billing`;
  const autoPrint = print === "1";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <style>{printStyle}</style>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PrintBar backHref={backHref} autoPrint={autoPrint} />

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
                    <tr><td style={{ padding: "2px 0 2px 16px", fontWeight: 600 }}>Invoice No.</td><td style={{ padding: "2px 0 2px 16px", color: "#6b7280" }}>{invoice.invoice_number}</td></tr>
                    <tr><td style={{ padding: "2px 0 2px 16px", fontWeight: 600 }}>Date</td><td style={{ padding: "2px 0 2px 16px", color: "#6b7280" }}>{fmtDisplay(invoice.invoice_date)}</td></tr>
                    <tr><td style={{ padding: "2px 0 2px 16px", fontWeight: 600 }}>Due Date</td><td style={{ padding: "2px 0 2px 16px", color: "#6b7280" }}>{fmtDisplay(invoice.due_date)}</td></tr>
                    {invoice.status === "paid" && invoice.paid_date && (
                      <tr><td style={{ padding: "2px 0 2px 16px", fontWeight: 600, color: "#1D9E75" }}>Paid</td><td style={{ padding: "2px 0 2px 16px", color: "#1D9E75" }}>{fmtDisplay(invoice.paid_date)}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40, padding: "20px 24px", background: "#f9fafb", borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Bill To</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{company.name}</div>
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
                  {["Description", "Qty", "Rate", "Amount"].map((h, i) => (
                    <th key={h} style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: i > 0 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item, idx) => (
                  <tr key={idx}>
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
                  <span style={{ color: "#6b7280" }}>Subtotal</span><span>{aed(subtotal)}</span>
                </div>
                {disc > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0" }}>
                    <span style={{ color: "#6b7280" }}>Discount</span><span style={{ color: "#dc2626" }}>-{aed(disc)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, padding: "10px 0 5px", borderTop: "1.5px solid #111", marginTop: 6 }}>
                  <span>Total</span><span>{aed(total)}</span>
                </div>
                {invoice.status === "paid" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1D9E75", background: "#d1fae5", padding: "4px 10px", borderRadius: 999, letterSpacing: "0.05em" }}>PAID</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Payment Details</div>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>
                  {PAYMENT_DETAILS.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
                </div>
              </div>
              {invoice.notes && invoice.notes !== PAYMENT_DETAILS && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Notes</div>
                  <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "pre-wrap" }}>{invoice.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
