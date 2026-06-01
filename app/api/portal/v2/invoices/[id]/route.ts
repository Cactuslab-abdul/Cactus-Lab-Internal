import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/portal/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { normInvoiceRow } from '@/lib/portal/format';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  delete body.id;
  delete body.created_at;
  delete body.updated_at;

  if (body.status === 'paid' && !body.paid_date) {
    body.paid_date = new Date().toISOString().split('T')[0];
  }
  if (body.status && body.status !== 'paid') {
    body.paid_date = null;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.from('invoices').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(normInvoiceRow(data));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { id } = await params;
  const supabase = createServiceClient();
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
