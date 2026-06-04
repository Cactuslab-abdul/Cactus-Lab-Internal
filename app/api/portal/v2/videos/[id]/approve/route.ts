import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { normVideoRow } from '@/lib/portal/format';
import type { VideoStatus } from '@/lib/portal/types';

type Action = 'approve' | 'revise' | 'undo';

function nextStatus(current: VideoStatus, action: Action): VideoStatus | null {
  if (action === 'approve') {
    // Client approving an idea (pending or revision state)
    if (current === 'idea_pending' || current === 'idea_revision') return 'idea_approved';
    // Client approving the final video
    if (current === 'ready_for_review') return 'client_approved';
    return null;
  }
  if (action === 'revise') {
    // Client can request revision from any reviewable state
    if (['idea_pending', 'idea_approved', 'ready_for_review', 'client_approved'].includes(current)) return 'idea_revision';
    return null;
  }
  if (action === 'undo') {
    // Client undoes their approval
    if (current === 'idea_approved') return 'idea_pending';
    if (current === 'client_approved') return 'ready_for_review';
    return null;
  }
  return null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json() as { action?: Action; note?: string };

  if (!['approve', 'revise', 'undo'].includes(body.action ?? '')) {
    return NextResponse.json({ error: "action must be 'approve', 'revise', or 'undo'" }, { status: 400 });
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

  const action = body.action as Action;
  const newStatus = nextStatus(video.status as VideoStatus, action);
  if (!newStatus) {
    return NextResponse.json({ error: `Cannot ${action} from status '${video.status}'` }, { status: 409 });
  }

  const updates: Record<string, unknown> = { status: newStatus };
  if (action === 'revise') updates.client_note = body.note!.trim();
  if (action === 'approve' || action === 'undo') updates.client_note = null;

  const { data: updated, error: updateErr } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', id)
    .select('id,company_id,title,type,month,number,stream_url,thumbnail_url,caption,posted_url,status,client_note,created_at,updated_at')
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, video: normVideoRow(updated) });
}
