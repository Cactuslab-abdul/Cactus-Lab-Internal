export type PortalRole = 'ADMIN' | 'EDITOR' | 'CLIENT';

export type VideoStatus =
  | 'idea_pending'
  | 'idea_approved'
  | 'idea_revision'
  | 'in_production'
  | 'ready_for_review'
  | 'client_approved'
  | 'posted';

export type VideoType = 'Reel' | 'Story' | 'Post' | 'TikTok' | 'LinkedIn';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface Company {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  instagram: string | null;
  email: string | null;
  whatsapp: string | null;
  package_name: string | null;
  retainer_aed: number;
  video_quota: number;
  start_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  company_id: string;
  title: string;
  type: VideoType;
  month: string;        // "2026-06"
  number: number;
  stream_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  posted_url: string | null;
  status: VideoStatus;
  internal_notes: string | null;  // stripped from CLIENT responses in API
  client_note: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientVideo = Omit<Video, 'internal_notes'>;

export interface VideoComment {
  id: string;
  video_id: string;
  user_id: string;
  user_email: string;
  timestamp_seconds: number | null;
  comment_text: string;
  created_at: string;
}

export interface Metric {
  id: string;
  company_id: string;
  month: string;           // "2026-06"
  followers: number;
  followers_change: number;
  views: number;
  reach: number;
  engagement_rate: number;
  top_post_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  desc: string;
  qty: number;
  rate: number;
  notes?: string;
  type?: 'retainer' | 'one-time' | 'addon';
}

export interface Invoice {
  id: string;
  company_id: string;
  invoice_number: string;
  month: string;           // "June 2026"
  invoice_date: string;    // ISO date
  due_date: string;        // ISO date
  amount_aed: number;
  discount_aed: number;
  total_aed: number;
  status: InvoiceStatus;
  paid_date: string | null;
  notes: string | null;
  line_items: LineItem[];
  created_at: string;
  updated_at: string;
}

export interface PortalRoleRow {
  id: string;
  user_id: string;
  role: PortalRole;
  company_id: string | null;
}

// API response shapes
export interface CompanyWithStats extends Company {
  pending_videos: number;    // videos awaiting client approval
  total_videos: number;
  unpaid_invoices: number;
}

export interface ClientDashboardData {
  company: Company;
  role: PortalRole;
  pending_count: number;     // videos needing approval
  unpaid_count: number;      // unpaid invoices
  latest_metrics: Metric | null;
}
