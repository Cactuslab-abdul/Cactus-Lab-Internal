import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/portal/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { normMetricRow, normMonth } from '@/lib/portal/format';

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const companyId = searchParams.get('company_id');

  if (isAdminRequest(req)) {
    let q = supabase.from('metrics').select('*');
    if (companyId) q = q.eq('company_id', companyId);
    if (slug && !companyId) {
      const { data: co } = await supabase.from('companies').select('id').eq('slug', slug).single();
      if (co) q = q.eq('company_id', co.id);
    }
    const { data, error } = await q.order('month', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).map(normMetricRow));
  }

  if (!slug && !companyId) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  let resolvedCompanyId = companyId;
  if (!resolvedCompanyId && slug) {
    const { data: co } = await supabase.from('companies').select('id').eq('slug', slug).single();
    if (!co) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    resolvedCompanyId = co.id;
  }

  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('company_id', resolvedCompanyId!)
    .order('month', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map(normMetricRow));
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await req.json();
  const { company_id, month, followers, followers_change, views, reach, engagement_rate, top_post_url, notes, platform_data } = body;
  if (!company_id || !month) return NextResponse.json({ error: 'company_id and month required' }, { status: 400 });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('metrics')
    .upsert({
      company_id, month: normMonth(month),
      followers: followers || 0,
      followers_change: followers_change || 0,
      views: views || 0,
      reach: reach || 0,
      engagement_rate: engagement_rate || 0,
      top_post_url: top_post_url || null,
      notes: notes || null,
      platform_data: platform_data || null,
    }, { onConflict: 'company_id,month' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(normMetricRow(data), { status: 201 });
}
