import { createClient } from '@/lib/supabase/server';
import type { Company, Video, ClientVideo, Metric, Invoice, CompanyWithStats } from './types';

export async function getCompany(slug: string): Promise<Company | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('companies').select('*').eq('slug', slug).single();
  return data ?? null;
}

export async function getAllCompanies(): Promise<Company[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('companies').select('*').eq('is_active', true).order('name');
  return data ?? [];
}

export async function getAllCompaniesWithStats(): Promise<CompanyWithStats[]> {
  const supabase = await createClient();
  const { data: companies } = await supabase.from('companies').select('*').eq('is_active', true).order('name');
  if (!companies) return [];

  const stats = await Promise.all(companies.map(async (c) => {
    const [{ count: pending }, { count: total }, { count: unpaid }] = await Promise.all([
      supabase.from('videos').select('*', { count: 'exact', head: true })
        .eq('company_id', c.id)
        .in('status', ['idea_pending', 'ready_for_review']),
      supabase.from('videos').select('*', { count: 'exact', head: true })
        .eq('company_id', c.id),
      supabase.from('invoices').select('*', { count: 'exact', head: true })
        .eq('company_id', c.id)
        .in('status', ['pending', 'overdue']),
    ]);
    return { ...c, pending_videos: pending ?? 0, total_videos: total ?? 0, unpaid_invoices: unpaid ?? 0 };
  }));

  return stats;
}

export async function getVideosForCompany(companyId: string, asClient = false): Promise<Video[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('videos')
    .select('*')
    .eq('company_id', companyId)
    .order('month', { ascending: false })
    .order('number');
  const rows = (data ?? []) as Video[];
  if (asClient) return rows.map(({ internal_notes: _, ...rest }) => ({ ...rest, internal_notes: null }));
  return rows;
}

export async function getMetricsForCompany(companyId: string): Promise<Metric[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('metrics')
    .select('*')
    .eq('company_id', companyId)
    .order('month', { ascending: false });
  return data ?? [];
}

export async function getInvoicesForCompany(companyId: string): Promise<Invoice[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('company_id', companyId)
    .order('invoice_date', { ascending: false });
  return data ?? [];
}
