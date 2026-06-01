import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: roleRow } = await supabase
    .from('portal_roles')
    .select('role, company_id, companies(slug, name, logo_url)')
    .eq('user_id', user.id)
    .single();

  if (!roleRow) return NextResponse.json({ error: 'No portal role assigned' }, { status: 403 });

  return NextResponse.json({
    user_id: user.id,
    email: user.email,
    role: roleRow.role,
    company_id: roleRow.company_id,
    company: roleRow.companies ?? null,
  });
}
