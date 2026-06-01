import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/portal/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { normInvoiceRow, invoiceMonthLabel } from '@/lib/portal/format';

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const companyId = searchParams.get('company_id');

  if (isAdminRequest(req)) {
    let q = supabase.from('invoices').select('*');
    if (companyId) q = q.eq('company_id', companyId);
    if (slug && !companyId) {
      const { data: co } = await supabase.from('companies').select('id').eq('slug', slug).single();
      if (co) q = q.eq('company_id', co.id);
    }
    const { data, error } = await q.order('invoice_date', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).map(normInvoiceRow));
  }

  if (!slug && !companyId) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  let resolvedCompanyId = companyId;
  if (!resolvedCompanyId && slug) {
    const { data: co } = await supabase.from('companies').select('id').eq('slug', slug).single();
    if (!co) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    resolvedCompanyId = co.id;
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('company_id', resolvedCompanyId!)
    .order('invoice_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(normInvoiceRow));
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await req.json();
  const { company_id, invoice_number, month, invoice_date, due_date, amount_aed, discount_aed, total_aed, notes, line_items } = body;
  if (!company_id || !invoice_number || !invoice_date || !due_date || total_aed == null) {
    return NextResponse.json({ error: 'company_id, invoice_number, invoice_date, due_date, total_aed required' }, { status: 400 });
  }

  // Always store month as the display label derived from invoice_date for consistency
  const monthLabel = month && !/^\d{4}-\d{2}/.test(month) ? month : invoiceMonthLabel(invoice_date);

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      company_id,
      invoice_number,
      month: monthLabel,
      invoice_date,
      due_date,
      amount_aed: amount_aed ?? total_aed,
      discount_aed: discount_aed || 0,
      total_aed,
      notes: notes || null,
      line_items: line_items || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(normInvoiceRow(data), { status: 201 });
}
