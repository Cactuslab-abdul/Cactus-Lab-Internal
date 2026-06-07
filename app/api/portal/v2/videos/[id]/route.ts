import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/portal/auth';
import { createServiceClient } from '@/lib/supabase/service';
import { normVideoRow, normMonth } from '@/lib/portal/format';
import { sendVideoReadyEmail } from '@/lib/portal/email';

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

  // Capture pre-update status so we can detect the transition to ready_for_review.
  const { data: before } = await supabase
    .from('videos').select('status, company_id, title').eq('id', id).single();

  const { data, error } = await supabase.from('videos').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify client when a video transitions INTO ready_for_review.
  // Don't re-fire if it was already in that state.
  if (before && before.status !== 'ready_for_review' && data.status === 'ready_for_review') {
    const { data: company } = await supabase
      .from('companies').select('slug, name, email').eq('id', data.company_id).single();
    if (company?.email) {
      const origin = req.nextUrl.origin;
      void sendVideoReadyEmail({
        to: company.email,
        companyName: company.name,
        videoTitle: data.title || 'Untitled video',
        portalUrl: `${origin}/portal/client/${company.slug}/content`,
      });
    }
  }

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
