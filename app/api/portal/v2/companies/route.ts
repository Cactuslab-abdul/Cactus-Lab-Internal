import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/portal/auth';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (isAdminRequest(req)) {
    const { data: companies, error } = await supabase.from('companies').select('*').eq('is_active', true).order('name');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!companies) return NextResponse.json([]);

    const stats = await Promise.all(companies.map(async (c) => {
      const [{ count: pending }, { count: total }, { count: unpaid }] = await Promise.all([
        supabase.from('videos').select('*', { count: 'exact', head: true }).eq('company_id', c.id).in('status', ['idea_pending', 'ready_for_review']),
        supabase.from('videos').select('*', { count: 'exact', head: true }).eq('company_id', c.id),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('company_id', c.id).in('status', ['pending', 'overdue']),
      ]);
      return { ...c, pending_videos: pending ?? 0, total_videos: total ?? 0, unpaid_invoices: unpaid ?? 0 };
    }));

    return NextResponse.json(stats);
  }

  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const { data } = await supabase
    .from('companies')
    .select('id,slug,name,logo_url,retainer_aed,package_name,start_date,video_quota')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await req.json();
  const { slug, name, logo_url, instagram, email, whatsapp, package_name, retainer_aed, video_quota, start_date } = body;
  if (!slug || !name) return NextResponse.json({ error: 'slug and name required' }, { status: 400 });

  const slugClean = String(slug).toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('companies')
    .insert({
      slug: slugClean,
      name,
      logo_url: logo_url || null,
      instagram: instagram || null,
      email: email || null,
      whatsapp: whatsapp || null,
      package_name: package_name || null,
      retainer_aed: retainer_aed || 0,
      video_quota: video_quota || 15,
      start_date: start_date || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
