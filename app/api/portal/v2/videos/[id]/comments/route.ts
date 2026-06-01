import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isAdminRequest } from '@/lib/portal/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('video_comments')
    .select('*')
    .eq('video_id', id)
    .order('timestamp_seconds', { nullsFirst: false })
    .order('created_at');

  if (error) return NextResponse.json([]);
  // Defensive: ensure user_email is always a string for the UI's .split('@')
  return NextResponse.json((data ?? []).map(c => ({ ...c, user_email: c.user_email || 'Client' })));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (!body.comment_text?.trim()) {
    return NextResponse.json({ error: 'comment_text required' }, { status: 400 });
  }

  const author = body.author || (isAdminRequest(req) ? 'Cactus Lab' : 'Client');

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('video_comments')
    .insert({
      video_id: id,
      user_email: author,
      timestamp_seconds: body.timestamp_seconds ?? null,
      comment_text: body.comment_text.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, user_email: data.user_email || 'Client' }, { status: 201 });
}
