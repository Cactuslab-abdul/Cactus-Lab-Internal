import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { normVideoRow } from '@/lib/portal/format';
import type { VideoStatus } from '@/lib/portal/types';

type Action = 'approve' | 'revise';

function nextStatus(current: VideoStatus, action: Action): VideoStatus | null {
  if (action === 'approve') {
    if (current === 'idea_pending') return 'idea_approved';
    if (current === 'ready_for_review') return 'client_approved';
    return null;
  }
  if (current === 'idea_pending' || current === 'ready_for_review') return 'idea_revision';
  return null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json() as { action?: Action; note?: string };

  if (body.action !== 'approve' && body.action !== 'revise') {
    return NextResponse.json({ error: "action must be 'approve' or 'revise'" }, { status: 400 });
  }
  if (body.action === 'revise' && !body.note?.trim()) {
    return NextResponse.json({ error: 'note required for revision request' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: video, error: fetchErr } = await supabase
    .from('videos')
    .select('id, status, company_id')
    .eq('id', id)
    .single();

  if (fetchErr || !video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  const newStatus = nextStatus(video.status as VideoStatus, body.action);
  if (!newStatus) {
    return NextResponse.json({ error: `Cannot ${body.action} from status '${video.status}'` }, { status: 409 });
  }

  const updates: Record<string, unknown> = { status: newStatus };
  if (body.action === 'revise') updates.client_note = body.note!.trim();

  const { data: updated, error: updateErr } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', id)
    .select('id,company_id,title,type,month,number,stream_url,thumbnail_url,caption,posted_url,status,client_note,created_at,updated_at')
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, video: normVideoRow(updated) });
}
