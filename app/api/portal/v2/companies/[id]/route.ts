import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/portal/auth';
import { createServiceClient } from '@/lib/supabase/service';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  delete body.id;
  delete body.created_at;
  delete body.updated_at;

  const supabase = createServiceClient();
  const { data, error } = await supabase.from('companies').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { id } = await params;
  const supabase = createServiceClient();
  // Soft-delete: set is_active = false (keep history of invoices/videos)
  const { error } = await supabase.from('companies').update({ is_active: false }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
