// ── Month / date helpers ────────────────────────────────────────────────────
// The DB stores videos.month and metrics.month as text. Different writers
// (seed scripts, manual inserts, form submits) may use "2026-06" or
// "2026-06-01" — normalize everything to "YYYY-MM" at the API boundary so
// every UI component can rely on a single format.

export function normMonth(m: unknown): string {
  if (typeof m !== 'string') return '';
  return m.slice(0, 7);
}

export function normVideoRow<T extends { month?: unknown }>(v: T): T {
  return { ...v, month: normMonth(v.month) } as T;
}

export function normMetricRow<T extends { month?: unknown }>(m: T): T {
  return { ...m, month: normMonth(m.month) } as T;
}

// Invoice.month is a display label like "June 2026" — derive from invoice_date
// when stored value looks like a date.
export function invoiceMonthLabel(invoiceDate: string): string {
  const d = new Date(invoiceDate + 'T00:00:00');
  return d.toLocaleDateString('en-AE', { month: 'long', year: 'numeric' });
}

export function normInvoiceRow<T extends { month?: unknown; invoice_date?: string }>(inv: T): T {
  // If month looks like a date ("2026-06-01"), replace with derived label.
  const m = inv.month;
  if (typeof m === 'string' && /^\d{4}-\d{2}-\d{2}/.test(m) && inv.invoice_date) {
    return { ...inv, month: invoiceMonthLabel(inv.invoice_date) } as T;
  }
  if (typeof m === 'string' && /^\d{4}-\d{2}$/.test(m) && inv.invoice_date) {
    return { ...inv, month: invoiceMonthLabel(inv.invoice_date) } as T;
  }
  return inv;
}
