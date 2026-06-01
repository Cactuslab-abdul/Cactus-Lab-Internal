import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/portal/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { normVideoRow, normMonth } from '@/lib/portal/format';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  // Strip any client-supplied immutable fields
  delete body.id;
  delete body.created_at;
  delete body.updated_at;
  if (body.month) body.month = normMonth(body.month);

  const supabase = createServiceClient();
  const { data, error } = await supabase.from('videos').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(normVideoRow(data));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  const supabase = createServiceClient();
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
