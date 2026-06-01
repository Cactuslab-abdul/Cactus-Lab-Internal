import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/portal/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { normVideoRow, normMonth } from '@/lib/portal/format';

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const companyId = searchParams.get('company_id');
  const month = searchParams.get('month');
  const admin = isAdminRequest(req);

  if (admin) {
    let q = supabase.from('videos').select('*');
    if (companyId) q = q.eq('company_id', companyId);
    if (slug) {
      const { data: co } = await supabase.from('companies').select('id').eq('slug', slug).single();
      if (co) q = q.eq('company_id', co.id);
    }
    if (month) q = q.eq('month', month);
    const { data, error } = await q.order('month', { ascending: false }).order('number');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).map(normVideoRow));
  }

  if (!slug && !companyId) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  let resolvedCompanyId = companyId;
  if (!resolvedCompanyId && slug) {
    const { data: co } = await supabase.from('companies').select('id').eq('slug', slug).single();
    if (!co) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    resolvedCompanyId = co.id;
  }

  const { data, error } = await supabase
    .from('videos')
    .select('id,company_id,title,type,month,number,stream_url,thumbnail_url,caption,posted_url,status,client_note,created_at,updated_at')
    .eq('company_id', resolvedCompanyId!)
    .order('month', { ascending: false })
    .order('number');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(normVideoRow));
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await req.json();
  const { company_id, title, type, month, number, stream_url, thumbnail_url, caption, posted_url, status, internal_notes } = body;
  if (!company_id || !title || !month) {
    return NextResponse.json({ error: 'company_id, title, month required' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('videos')
    .insert({
      company_id, title, type: type || 'Reel',
      month: normMonth(month),
      number: number || 1,
      stream_url: stream_url || null,
      thumbnail_url: thumbnail_url || null,
      caption: caption || null,
      posted_url: posted_url || null,
      status: status || 'idea_pending',
      internal_notes: internal_notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(normVideoRow(data), { status: 201 });
}
